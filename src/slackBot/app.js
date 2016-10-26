
import slack from 'slack';
import P from 'bluebird';
import R from 'ramda';
import zlib from 'zlib';
import request from 'request';
import AWS from 'aws-sdk';
import logger from '../shared/logger';

AWS.config.setPromisesDependency(P);

const token = process.env.SLACK_TOKEN_INT;
const bot = slack.rtm.client();

const slackFetcher = request.defaults({
  headers: { Authorization: `Bearer ${token}` }
});

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET
});

const slackDeleteFile = P.promisify(slack.files.delete);
const slackPostMessage = P.promisify(slack.chat.postMessage);
const slackChannelsList = P.promisify(slack.channels.list);

const slackFileStream = ({ id, name, mimetype, url_private_download }) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `${id}_${Date.now()}_${name}.gz`,
    ContentType: 'application/x-gzip',
    ACL: 'public-read',
    Expires: 1,
    Body: slackFetcher(url_private_download).pipe(zlib.createGzip())
  };

  const p = new P((resolve, reject) => {
    s3.upload(params, (err, d) => {
      if (err) return reject(err);
      return resolve(d);
    });
  });

  return p;
};

const getFileInfo = R.pipeP(
  P.promisify(slack.files.info),
);

const fileHandler = msg => {
  logger.info(msg);
  const file = R.path(['file', 'id'], msg);
  const userId = R.prop('user_id', msg);
  return getFileInfo({ token, file })
    .then((d) => {
      const { id, name, mimetype, url_private_download } = R.prop('file', d);
      logger.info({ id, name, mimetype, url_private_download });
      return slackFileStream({ id, name, mimetype, url_private_download });
    })
    .then((d) => {
      logger.info('File on s3', d);
      const url = R.prop('Location', d);
      return slackPostMessage({ token, channel: userId, text: url });
    })
    .catch(logger.error.bind(logger))
    .finally(() => slackDeleteFile({ file, token: process.env.SLACK_TOKEN_TEST }));
};

bot.file_shared(fileHandler);
bot.listen({ token });

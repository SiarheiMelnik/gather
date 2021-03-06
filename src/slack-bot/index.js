
import slack from 'slack';
import P from 'bluebird';
import R from 'ramda';
import zlib from 'zlib';
import request from 'request';
import AWS from 'aws-sdk';
import moment from 'moment';
import { futurizeP } from 'futurize';
import { Future } from 'ramda-fantasy';
import logger from '../shared/logger';

const futureP = futurizeP(Future);

const token = process.env.SLACK_TOKEN_INT;
const bot = slack.rtm.client();

const slackFetcher = request.defaults({
  headers: { Authorization: `Bearer ${token}` }
});

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET,
  logger: {
    log: R.bind(logger.info, logger)
  }
});

const slackDeleteFile = P.promisify(slack.files.delete);
const slackPostMessage = P.promisify(slack.chat.postMessage);
const slackChannelsList = P.promisify(slack.channels.list);
const s3PutBucketLifecycleConfiguration = P.promisify(s3.putBucketLifecycleConfiguration);
const s3Upload = (params) =>
  new P((resolve, reject) => {
    const upload = s3.upload(params);
    return upload.send((err, res) => {
      if (err) return reject(err);
      return resolve(res);
    });
  });

const log = (d) => {
  logger.info(d);
  return P.resolve(d);
};

const fileStream = (url_private_download) =>
  slackFetcher(url_private_download).pipe(zlib.createGzip());

const getS3FileParams = ({ id, name, user, url_private_download }) => ({
  Bucket: process.env.AWS_S3_BUCKET,
  Key: `${id}_${Date.now()}_${name}.gz`,
  ContentEncoding: 'application/x-gzip',
  ACL: 'public-read',
  Expires: moment().add(1, 'days').unix(),
  Metadata: {
    id,
    user
  },
  Body: fileStream(url_private_download)
});

const uploadToS3 = R.pipeP(
  R.pipe(R.prop('file'), P.resolve),
  R.pipe(getS3FileParams, P.resolve),
  s3Upload
);

const postMessage = (channel, text) =>
  slackPostMessage({ token, channel, text, as_user: true });

const notifyUser = (userId) => R.pipeP(
  R.pipe(R.prop('Location'), P.resolve),
  R.curry(postMessage)(userId)
);

const removeFile = R.curry((file, _) =>
  slackDeleteFile({ file, token: process.env.SLACK_TOKEN_TEST }));

const fileHandler = msg => {
  logger.info(msg);
  const file = R.path(['file', 'id'], msg);
  const userId = R.prop('user_id', msg);

  const pipeline = R.pipeP(
    P.promisify(slack.files.info),
    log,
    uploadToS3,
    log,
    removeFile(file)
  );

  return pipeline({ file, token })
    .catch(logger.error.bind(logger));
};

bot.file_shared(fileHandler);

bot.listen({ token }, (err, d) => logger.info('Bot is ready'));

bot.message(logger.info.bind(logger));

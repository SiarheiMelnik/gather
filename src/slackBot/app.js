
import slack from 'slack';
import P from 'bluebird';
import R from 'ramda';
import zlib from 'zlib';
import request from 'request';
import fs from 'fs';
import AWS from 'aws-sdk';
import logger from '../shared/logger';

AWS.config.setPromisesDependency(P);
AWS.config.region = process.env.AWS_REGION;

const token = process.env.SLACK_TOKEN_INT;
const bot = slack.rtm.client();

const slackFetcher = request.defaults({
  headers: { Authorization: `Bearer ${token}` }
});

const s3 = new AWS.S3();

const slackDeleteFile = P.promisify(slack.files.delete);
const slackFileStream = ({ id, name, url_private_download }) => {
  const params = {
    Bucket: 'gather-bot-bucket',
    Key: `${id}_${Date.now()}_${name}`,
    Body: slackFetcher(url_private_download)
  };

  return s3.putObject(params).promise();
};

const getFileInfo = R.pipeP(
  P.promisify(slack.files.info),
);

const fileHandler = msg => {
  const file = R.path(['file', 'id'], msg);
  return getFileInfo({ token, file })
    .then((d) => {
      const { id, name, mimetype, url_private_download } = R.prop('file', d);
      logger.info({ id, name, mimetype, url_private_download });
      return slackFileStream({ id, name, mimetype, url_private_download });
    })
    .then(() => logger.info('File on s3'))
    .catch(logger.error.bind(logger))
    //.finally(slackDeleteFile({ file, token: process.env.SLACK_TOKEN_TEST }));
};

bot.file_shared(fileHandler);
bot.listen({ token });

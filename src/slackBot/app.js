
import slack from 'slack';
import P from 'bluebird';
import R from 'ramda';
import zlib from 'zlib';
import request from 'request';
import fs from 'fs';
import logger from '../shared/logger';

const token = process.env.SLACK_TOKEN_INT;
const bot = slack.rtm.client();
const slackFetcher = request.defaults({
  headers: { Authorization: `Bearer ${token}` }
});

const slackDeleteFile = P.promisify(slack.files.delete);

const slackFileStream = ({ id, name, url_private_download }) =>
  slackFetcher(url_private_download)
  .pipe(fs.createWriteStream(`./${name}`))
  .on('error', logger.error.bind(logger))
  .on('finish', () => {
    logger.info(`File ${name} downloaded`);
    slackDeleteFile({ file: id, token: process.env.SLACK_TOKEN_TEST })
    .catch(logger.error.bind(logger));
  });

const getFileInfo = R.pipeP(
  P.promisify(slack.files.info),
);

const fileHandler = msg => {
  const file = R.path(['file', 'id'], msg);
  return getFileInfo({ token, file })
    .then((d) => {
      logger.info(d);
      const { id, name, mimetype, url_private_download } = R.prop('file', d);
      return slackFileStream({ id, name, mimetype, url_private_download });
    });
};

bot.file_shared(fileHandler);
bot.listen({ token });

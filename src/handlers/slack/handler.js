
import slack from 'slack';
import P from 'bluebird';
import R from 'ramda';
import logger from '../../shared/logger';

const appToken = process.env.SLACK_TOKEN;
const intToken = process.env.SLACK_TOKEN_INT;

const slackPostMessage = P.promisify(slack.chat.postMessage);

const postMessage = (channel, text, attachments) =>
  slackPostMessage({ token: intToken, channel, text, attachments, as_user: true });


export const events = (event, context, cb) => {
  const body = JSON.parse(event.body);
  logger.info(body);
  const { token, challenge, type } = body;

  if (appToken !== token) return cb(null, { statusCode: 401 });

  switch(type) {
    case 'url_verification':
      return cb(null, {
        statusCode: 200,
        body: JSON.stringify({ challenge })
      });
    default:
      return cb(null, {
        statusCode: 200,
      });
  }
};

export const commands = (event, ctx, cb) => {
  logger.info(event);
  return cb(null, {statusCode: 200, body: JSON.stringify('pong')});
};


export const renderer = (e, ctx, cb) => {
  const { meta: { user }, data } = JSON.parse(e.Records[0].Sns.Message);
  logger.info({ data });

  const txn = data[0].txn;
  const buildTable = (d) =>
    R.map(k =>
      ({ title: k, value: d[k] }),
      R.keys(d)
    );

  const fields = R.chain(buildTable, txn);

  const attachments = [
    {
      text: 'Transactions',
      fallback: 'Transactions',
      fields,
      color: '#7CD197'
    }
  ];

  logger.info(attachments);

  postMessage(user, '', attachments);

  return cb(null, {
    statusCode: 200
  });
}

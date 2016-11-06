
import logger from '../../shared/logger';

const appToken = process.env.SLACK_TOKEN;

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
  logger.info(e);

  return cb(null, {
    statusCode: 200
  });
}

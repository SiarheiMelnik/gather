
const appToken = process.env.SLACK_TOKEN;

export const events = (event, context, cb) => {
  const body = JSON.parse(event.body);
  console.log(body);
  const { token, challenge, type } = body;

  if (appToken !== token) return cb(null, { statusCode: 401 });

  switch(type) {
    case 'url_verification':
      return cb(null, {
        statusCode: 200,
        body: JSON.stringify({ challenge })
      });
    case 'file_created':
    case 'file_shared':
      console.log(body);
      return cb(null, {
        statusCode: 200
      });
      break;
    default:
      return cb(null, {
        statusCode: 200,
      });
  }
};

export const commands = (event, ctx, cb) => {
  console.log(event);
  return cb(null, {statusCode: 200, body: JSON.stringify('pong')});
};


export const run = (event, context, cb) => {
  console.log(event);
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }),
  };

  return cb(null, response);
};

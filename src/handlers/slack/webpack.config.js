
const merge = require('webpack-merge');
const config = require('../../../webpack.base');

module.exports = merge(config, {
  entry: {
      'handler-slack': [
        'babel-polyfill',
        './handler'
      ],
    }
  });

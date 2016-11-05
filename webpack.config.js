
const merge = require('webpack-merge');
const config = require('./webpack.base');

module.exports = merge(config, {
  entry: {
    'bot-slack': [
      'babel-polyfill',
      './src/slack-bot'
    ]
  }
});

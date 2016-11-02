
const config = require('./webpack.base');
const merge = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = merge(config, {
  entry: {
    'handler-slack': [
      'babel-polyfill',
      './index'
    ]
  }
});

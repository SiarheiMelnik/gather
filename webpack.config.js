
require('dotenv').config();

const path = require('path');
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');

module.exports = {
  target: 'node',
  entry: {
    'handler-slack': [
      'babel-polyfill',
      './src/handlers/slack/handler'
    ],
    'bot-slack': [
      'babel-polyfill',
      './src/slackBot/app'
    ]
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel',
      query: {
        cacheDirectory: true,
        presets: ['es2016-node4'],
        plugins: [
          ['transform-runtime', {
            helpers: false,
            polyfill: false,
            regenerator: false,
          }]
        ]
      }
    }]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
        SLACK_TOKEN: JSON.stringify(process.env.SLACK_TOKEN),
        SLACK_TOKEN_INT: JSON.stringify(process.env.SLACK_TOKEN_INT),
        SLACK_CLIENT_ID: JSON.stringify(process.env.SLACK_CLIENT_ID),
        SLACK_CLIENT_SECRET: JSON.stringify(process.env.SLACK_CLIENT_SECRET),
        SLACK_TOKEN_TEST: JSON.stringify(process.env.SLACK_TOKEN_TEST),
        AWS_REGION: JSON.stringify(process.env.AWS_REGION),
        AWS_KEY: JSON.stringify(process.env.AWS_KEY),
        AWS_SECRET: JSON.stringify(process.env.AWS_SECRET),
        AWS_S3_BUCKET: JSON.stringify(process.env.AWS_S3_BUCKET)
      }
    })
  ],
  externals: [nodeExternals()],
  output: {
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js'
  }
};


require('dotenv').config();

const path = require('path');
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');
const BabiliPlugin = require("babili-webpack-plugin");

module.exports = {
  target: 'node',
  module: {
    loaders: [
      {
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
            }],
            'ramda'
          ]
        }
      },
      {
        test: /\.json$/,
        loader: 'json'
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new webpack.EnvironmentPlugin([
      'SLACK_TOKEN',
      'SLACK_TOKEN_INT',
      'SLACK_CLIENT_ID',
      'SLACK_CLIENT_SECRET',
      'SLACK_TOKEN_TEST',
      'AWS_REGION',
      'AWS_KEY',
      'AWS_SECRET',
      'AWS_S3_BUCKET'
    ]),
    new webpack.optimize.DedupePlugin(),
    // new BabiliPlugin()
  ],
  externals: [nodeExternals({
    whitelist: [
      /^ramda/,
      'babel-polyfill',
      'bluebird',
      'moment',
      'ramda-fantasy',
      'futurize'
    ]
  })],
  output: {
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '.build'),
    filename: '[name].js'
  }
};

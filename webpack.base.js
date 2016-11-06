


const path = require('path');
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');
const BabiliPlugin = require("babili-webpack-plugin");

const ROOT = path.normalize(path.join(__dirname, '.'));
const BUILD = path.join(ROOT, '.build');

require('dotenv').config(
  { path: path.join(ROOT, '.env') }
);

module.exports = {
  target: 'node',
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
          }],
          'ramda'
        ]
      }
    }]
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
    ],
    modulesDir: path.join(ROOT, 'node_modules')
  })],
  output: {
    libraryTarget: 'commonjs2',
    path: BUILD,
    filename: '[name].js'
  },
  resolve: {
    extensions: ['', '.js'], // .json is ommited to ignore ./firebase.json
    modulesDirectories: ['src', 'node_modules'],
    root: ROOT
  }
};

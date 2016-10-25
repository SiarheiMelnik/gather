
require('dotenv').config();

const path = require('path');
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');

module.exports = {
  target: 'node',
  entry: {
    slack: [
      'babel-polyfill',
      './src/handlers/slack/handler'
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
          }],
        ]
      }
    }]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
        SLACK_TOKEN: JSON.stringify(process.env.SLACK_TOKEN),
        // SLACK_CLIENT_SECRET: JSON.stringify(process.env.SLACK_CLIENT_SECRET),
      }
    })
  ],
  externals: [nodeExternals()],
  output: {
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '.webpack'),
    filename: 'handler-[name].js'
  }
};

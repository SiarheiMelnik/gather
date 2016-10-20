
require('dotenv').config();

const path = require('path');
const nodeExternals = require('webpack-node-externals');

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
  externals: [nodeExternals()],
  output: {
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '.webpack'),
    filename: 'handler-[name].js'
  }
};

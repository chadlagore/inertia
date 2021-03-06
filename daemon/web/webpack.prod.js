const webpack = require('webpack');
const MinifyPlugin = require('babel-minify-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: './index.html',
  filename: 'index.html',
  inject: 'body',
});

const config = {
  mode: 'production',
  entry: ['babel-polyfill', './index.js'],
  output: {
    path: `${__dirname}/public/`,
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['es2015', 'react', 'stage-3'],
            },
          },
        ],
      },
      {
        test: /\.sass/,
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },
  plugins: [
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    HtmlWebpackPluginConfig,
    new MinifyPlugin(),
  ],
};

module.exports = config;

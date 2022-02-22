const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  devServer: {
    proxy: {
      '/socket.io': {
        target: 'ws://localhost:3009',
        ws: true // important
      },
    },
    static: './dist',
  },
  mode: 'development',
  entry: {
    local: ['./src/local/local.ts'],
    remote: ['./src/remote/remote.ts'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  devtool: 'inline-source-map',
  plugins: [
    new HtmlWebpackPlugin({
      chunks: ['remote'],
      filename: 'remote.html',
      template: 'src/remote/remote.html'
    }),
    new HtmlWebpackPlugin({
      chunks: ['local'],
      filename: 'index.html',
      template: 'src/local/local.html'
    })
  ],
  output: {
    clean: true,
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
};
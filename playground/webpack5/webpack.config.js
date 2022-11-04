const unpluginSenrty = require('../../dist/webpack.cjs').default
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    unpluginSenrty({
      url: 'https://sentry.io/',
      org: 'kricsleo',
      project: 'demo',
      cleanLocal: false,
      deploy: { env: 'production'},
      authToken: 'a38a7e0a606045a1ab35ce877f53975684db943b9c424bb18925db86993dab05'
    }),
  ],
  stats: 'errors-only',
};

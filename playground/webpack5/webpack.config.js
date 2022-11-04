const path = require('path');
const unpluginSenrty = require('../../dist/webpack.cjs').default

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
      publish: process.env.NODE_ENV === 'production',
      dryRun: true,
    }),
  ],
  devtool: 'hidden-source-map',
  stats: 'errors-only',
};

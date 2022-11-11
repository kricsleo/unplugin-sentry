const path = require('path');
const unpluginSentry = require('../../dist/webpack').default

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    unpluginSentry({
      url: 'https://sentry.io/',
      org: 'kricsleo',
      project: 'demo',
      authToken: 'xxxxxx',
      publish: process.env.NODE_ENV === 'production',
      cleanLocal: false,
      dryRun: true,
    }),
  ],
  stats: 'errors-only',
};

import Path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
// eslint-disable-next-line import/default
import CopyWebpackPlugin from 'copy-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import Unplugin from '../../../dist/webpack.js'

const _dirname = typeof __dirname !== 'undefined'
  ? __dirname
  : dirname(fileURLToPath(import.meta.url))
export default {
  entry: {
    app: Path.resolve(_dirname, '../src/scripts/index.ts'),
  },
  devtool: 'inline-source-map',
  output: {
    path: Path.join(_dirname, '../build'),
    filename: 'js/[name].js',
    publicPath: 'dist',
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      name: false,
    },
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [{ from: Path.resolve(_dirname, '../public'), to: 'public' }],
    }),
    new HtmlWebpackPlugin({
      template: Path.resolve(_dirname, '../src/index.html'),
    }),
    Unplugin({
      project: 'demo',
      org: 'sentry',
      cleanLocal: false,
    }),
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '~': Path.resolve(_dirname, '../src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      },
      {
        test: /\.html$/i,
        loader: 'html-loader',
      },
      {
        test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
        type: 'asset',
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
}

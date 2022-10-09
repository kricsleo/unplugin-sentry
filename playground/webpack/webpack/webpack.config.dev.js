import Path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import Webpack from 'webpack'
import { merge } from 'webpack-merge'
import StylelintPlugin from 'stylelint-webpack-plugin'
import common from './webpack.common.js'

const _dirname = typeof __dirname !== 'undefined'
  ? __dirname
  : dirname(fileURLToPath(import.meta.url))

export default merge(common, {
  target: 'web',
  mode: 'development',
  devtool: 'eval-cheap-source-map',
  output: {
    chunkFilename: 'js/[name].chunk.js',
  },
  devServer: {
    client: {
      logging: 'error',
    },
    hot: true,
  },
  plugins: [
    new Webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
    new StylelintPlugin({
      files: Path.join('src', '**/*.s?(a|c)ss'),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        include: Path.resolve(_dirname, '../src'),
        loader: 'babel-loader',
      },
      {
        test: /\.s?css$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          'postcss-loader',
          'sass-loader',
        ],
      },
    ],
  },
})

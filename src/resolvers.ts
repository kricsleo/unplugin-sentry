import { normalize } from 'path'
import type { UnpluginOptions } from 'unplugin'
import { uploadSourcemap } from './sentry'
import type { Options } from './types'

/**
 * vite
 */
export function resolveViteConfig(options: Options): UnpluginOptions['vite'] {
  return {
    // only apply it when `build` & `sourcemap`
    apply({ build }, { command }) {
      return !!(command === 'build' && build?.sourcemap)
    },
    configResolved(resolvedConfig) {
      const { build, env } = resolvedConfig
      mergeSentryOptions(options, {
        include: [normalize(`./${build.outDir}/${build.assetsDir}`)],
        urlPrefix: normalize(`~${env.BASE_URL}/${build.assetsDir}/`),
      })
    },
    async closeBundle() {
      await uploadSourcemap(options)
    },
  }
}

/**
 * rollup
 */
export function resolveRollupConfig(options: Options): UnpluginOptions['rollup'] {
  return {
    renderStart(output) {
      mergeSentryOptions(options, {
        include: output.dir ? [output.dir] : undefined,
      })
    },
    async closeBundle() {
      await uploadSourcemap(options)
    },
  }
}

/**
 * webpack
 */
export function resovleWebpackConfig(options: Options): UnpluginOptions['webpack'] {
  return (compiler) => {
    compiler.hooks.afterEmit.tapAsync('UnpluginSentry', async (compilation, cb) => {
      const { publicPath, path } = compiler.options.output
      if (publicPath === 'auto') {
        // @see https://webpack.js.org/guides/public-path/#automatic-publicpath
        return cb(new Error('[UnpluginSenrty]: Auto-detect `include` failed, because `publicPath` of webpack is `auto`. You should specify `include` yourself.'))
      }
      mergeSentryOptions(options, {
        include: [path!],
        urlPrefix: normalize(`~/${publicPath}`),
      })
      await uploadSourcemap(options).then(() => cb())
        .catch(e => cb(e))
    })
  }
}

/**
 * Merget sentry options with bundler config
 */
function mergeSentryOptions(options: Options, bundlerConfig: {
  include?: string[]
  urlPrefix?: string
}) {
  options.deploy ||= {}
  options.deploy.env ||= process.env.NODE_ENV
  options.sourcemap ||= {}
  options.sourcemap.include ||= bundlerConfig.include
  options.sourcemap.urlPrefix ||= bundlerConfig.urlPrefix
}

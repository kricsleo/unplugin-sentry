import { normalize } from 'path'
import type { UnpluginOptions } from 'unplugin'
import type { Options } from './types'

/** output warning message */
export const logger = {
  warn: (e: string | Error) => console.warn(e),
  error: (e: string | Error) => console.error(e)
}

/**
 * vite
 */
export function resolveViteConfig(options: Options): UnpluginOptions['vite'] {
  return {
    config(config) {
      if(options.publish) {
        config.build ||= {}
        if(config.build.sourcemap !== 'hidden') {
          !options.silent && logger.warn(`[UnpluginSentry] When publishing with sentry, the vite's "build.sourcemap" config will be automatically set to "hidden".`)
          config.build.sourcemap = 'hidden'
        }
      }
    },
    configResolved(resolvedConfig) {
      const { build, env, mode } = resolvedConfig
      defaults(options, {
        deploy: { env: mode || process.env.NODE_ENV },
        sourcemap: {
          include: [normalize(`./${build.outDir}/${build.assetsDir}`)],
          urlPrefix: normalize(`~/${env.BASE_URL}/${build.assetsDir}/`),
        }
      })
    },
  }
}

/**
 * rollup
 */
export function resolveRollupConfig(options: Options): UnpluginOptions['rollup'] {
  return {
    async renderStart(output) {
      if(options.publish) {
        if(output.sourcemap !== 'hidden') {
          !options.silent && logger.warn(`[UnpluginSentry] When publishing with sentry, the rollup's "build.sourcemap" config will be automatically set to "hidden".`)
          output.sourcemap = 'hidden'
        }
      }
      defaults(options, {
        deploy: { env: process.env.NODE_ENV },
        sourcemap: {
          include: output.dir ? [output.dir] : [],
        }
      })
    },
  }
}

/**
 * webpack
 */
export function resovleWebpackConfig(options: Options): UnpluginOptions['webpack'] {
  return (compiler) => {
    if(options.publish) {
      if(compiler.options.devtool !== 'hidden-source-map') {
        !options.silent && logger.warn(`[UnpluginSentry] When publishing with sentry, the webpack's "devtool" config will be automatically set to "hidden-source-map".`)
        compiler.options.devtool = 'hidden-source-map'
      }
    }

    const { publicPath, path } = compiler.options.output
    // publicPath: 'auto' - https://webpack.js.org/guides/public-path/#automatic-publicpath
    const urlPrefix = !publicPath || publicPath === 'auto' 
      ? undefined
      : normalize(`~/${publicPath}`)
    defaults(options, {
      deploy: { env: compiler.options.mode || process.env.NODE_ENV },
      sourcemap: {
        include: path ? [path] : [],
        urlPrefix
      }
    })
  }
}

type Pair = Record<string | symbol, any>
type DeepPaitial<T> = T extends Pair
  ? {
    [k in keyof T]?: DeepPaitial<T[k]>
  }
  : T
export function defaults<T extends Pair>(target: T, source: DeepPaitial<T>): T {
  Object.keys(source).forEach(key => {
    if(target[key] === undefined) {
      // @ts-ignore
      target[key] = source[key]
    } else if(typeof target[key] === 'object' && typeof source[key] === 'object') {
      defaults(target[key], source[key])
    }
  })
  return target
}

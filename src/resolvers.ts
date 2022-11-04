import { normalize } from 'path'
import type { UnpluginOptions } from 'unplugin'
import { getRelease, publishProject } from './sentry'
import type { Options } from './types'
import { getVirtualContent, resolvedVirtualModuleId, virtualModuleId } from './virtual-module'
import VirtualModulesPlugin from 'webpack-virtual-modules'

/**
 * vite
 */
export function resolveViteConfig(options: Options): UnpluginOptions['vite'] {
  let resoleConfigPromise: Promise<void>
  return {
    configResolved(resolvedConfig) {
      const { build, env, mode } = resolvedConfig
      resoleConfigPromise = (async () => {
        const release = await getRelease(options)
        mergeSentryOptions(options, {
          env: mode,
          release,
          include: [normalize(`./${build.outDir}/${build.assetsDir}`)],
          urlPrefix: normalize(`~/${env.BASE_URL}/${build.assetsDir}/`),
        })
      })()
    },
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    async load(id) {
      if (id === resolvedVirtualModuleId) {
        await resoleConfigPromise
        return getVirtualContent(options)
      }
    },
    async closeBundle() {
      if(options.publish) {
        await resoleConfigPromise
        await publishProject(options)
      }
    },
  }
}

/**
 * rollup
 */
export function resolveRollupConfig(options: Options): UnpluginOptions['rollup'] {
  let resoleConfigPromise: Promise<void>
  let releasePromise = getRelease(options)
  return {
    async renderStart(output) {
      resoleConfigPromise = (async () => {
        const release = await releasePromise
        // todo: add rollup default configs
        mergeSentryOptions(options, {
          release,
          include: output.dir ? [output.dir] : [],
        })
      })()
    },
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    async load(id) {
      if (id === resolvedVirtualModuleId) {
        const release = await releasePromise
        mergeSentryOptions(options, { release })
        return getVirtualContent(options)
      }
    },
    async closeBundle() {
      if(options.publish) {
        await resoleConfigPromise
        await publishProject(options)
      }
    },
  }
}

/**
 * webpack
 */
export function resovleWebpackConfig(options: Options): UnpluginOptions['webpack'] {
  return (compiler) => {

    // add webpack virtual module
    const webpackVirtualMoudle = `node_modules/${virtualModuleId}.js`
    const virtualModules = new VirtualModulesPlugin({
      [webpackVirtualMoudle]: getVirtualContent(options)
    });
    virtualModules.apply(compiler)

    // resolve config
    const resoleConfigPromise = (async () => {
      const release = await getRelease(options)
      const { publicPath, path } = compiler.options.output

      // publicPath === 'auto': https://webpack.js.org/guides/public-path/#automatic-publicpath
      const urlPrefix = !publicPath || publicPath === 'auto' 
        ? undefined
        : normalize(`~/${publicPath}`)
      mergeSentryOptions(options, {
        release,
        include: path ? [path] : [],
        urlPrefix
      })

      // update virtual module
      virtualModules.writeModule(webpackVirtualMoudle, getVirtualContent(options))
    })()

    // publish project
    if(options.publish) {
      compiler.hooks.done.tap('UnpluginSentry', async () => {
        await resoleConfigPromise
        await publishProject(options)
      })
    }
  }
}

/**
 * Merget sentry options with bundler config
 */
function mergeSentryOptions(options: Options, bundlerConfig: Partial<Options> & {
  include?: string[]
  urlPrefix?: string
  env?: string
}) {
  options.release ||= bundlerConfig.release
  options.deploy ||= {}
  options.deploy.env ||= bundlerConfig.env || process.env.NODE_ENV
  if(options.sourcemap === false) {
    options.sourcemap = { include: [] }
  } else {
    options.sourcemap ||= {}
    options.sourcemap.include ||= bundlerConfig.include
    options.sourcemap.urlPrefix ||= bundlerConfig.urlPrefix
  }
}

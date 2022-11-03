import { normalize } from 'path'
import type { UnpluginOptions } from 'unplugin'
import { getRelease, uploadSourcemap } from './sentry'
import type { Options } from './types'
import { getVirtualContent, resolvedVirtualModuleId, virtualModuleId } from './virtual-module'
import VirtualModulesPlugin from 'webpack-virtual-modules'

/**
 * vite
 */
export function resolveViteConfig(options: Options): UnpluginOptions['vite'] {
  let shouldUploadSourcemap = false
  let resoleConfigPromise: Promise<void>
  return {
    apply({ build }, { command }) {
      // only upload sourcemap when building and sourcemap exists
      shouldUploadSourcemap = !!(command === 'build' && build?.sourcemap)
      return true
    },
    configResolved(resolvedConfig) {
      const { build, env, mode } = resolvedConfig
      resoleConfigPromise = (async () => {
        const release = await getRelease(options)
        mergeSentryOptions(options, {
          env: mode,
          release,
          include: [normalize(`./${build.outDir}/${build.assetsDir}`)],
          urlPrefix: normalize(`~${env.BASE_URL}/${build.assetsDir}/`),
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
      if(shouldUploadSourcemap) {
        await resoleConfigPromise
        await uploadSourcemap(options)
      }
    },
  }
}

/**
 * rollup
 */
export function resolveRollupConfig(options: Options): UnpluginOptions['rollup'] {
  return {
    async renderStart(output) {
      const release = await getRelease(options)
      mergeSentryOptions(options, {
        release,
        include: output.dir ? [output.dir] : undefined,
      })
    },
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return getVirtualContent(options)
      }
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

    // add webpack virtual module
    const webpackVirtualMoudle = `node_modules/${virtualModuleId}.js`
    const virtualModules = new VirtualModulesPlugin({
      [webpackVirtualMoudle]: getVirtualContent(options)
    });
    virtualModules.apply(compiler)
    const releasePromsie = getRelease(options)

    // update virtual module
    releasePromsie.then(release => {
      virtualModules.writeModule(webpackVirtualMoudle, getVirtualContent({
        ...options,
        release
      }))
    })

    // only upload sourcemap when building and sourcemap exists
    const shouldUploadSourcemap = !compiler.watchMode && compiler.options.devtool
    if(shouldUploadSourcemap) {
      compiler.hooks.afterEmit.tapAsync('UnpluginSentry', async (compilation, cb) => {
        const { publicPath, path } = compiler.options.output
        if (publicPath === 'auto') {
          // @see https://webpack.js.org/guides/public-path/#automatic-publicpath
          return cb(new Error('[UnpluginSenrty]: Auto-detect "include" failed, because "publicPath" of webpack is "auto". You can specify "include" yourself.'))
        }
        try {
          const release = await releasePromsie
          mergeSentryOptions(options, {
            release,
            include: [path!],
            urlPrefix: normalize(`~/${publicPath}`),
          })
          // todo
          // await uploadSourcemap(options)
          cb()
        } catch(e) {
          cb(e as Error)
        }
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
  options.deploy.env ||= bundlerConfig.env
  options.sourcemap ||= {}
  options.sourcemap.include ||= bundlerConfig.include
  options.sourcemap.urlPrefix ||= bundlerConfig.urlPrefix
}

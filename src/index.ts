import { createUnplugin } from 'unplugin'
import type { UnpluginFactory } from 'unplugin'
import type { Options } from './types'
import { defaults, resolveRollupConfig, resolveViteConfig, resovleWebpackConfig } from './resolvers'
import { getVirtualContent, resolvedVirtualModuleId, virtualModuleId } from './virtual-module'
import { getRelease, publishProject } from './sentry'

/**
 * Default options
 */
const defaultOptions: Partial<Options> = {
  finalize: true,
  cleanLocal: true,
  shortRelease: true,
}

export const unpluginFactory: UnpluginFactory<Options | undefined> = options => {
  const opts = Object.assign({}, defaultOptions, options)
  const resolveOptsPromise = getRelease(opts)
    .then(release => defaults(opts, { release }))

  return {
    name: 'unplugin-sentry',
    enforce: 'post',
    resolveId(id) {
      return id === virtualModuleId
        ? resolvedVirtualModuleId
        : null
    },
    loadInclude(id) {
      return id === resolvedVirtualModuleId
    },
    async load(id) {
      if (id !== resolvedVirtualModuleId) {
        return null
      }
      await resolveOptsPromise
      return {
        code: getVirtualContent(opts),
        map: { version: 3, mappings: '', sources: [] } as any,
      }
    },
    async writeBundle() {
      if (!opts.publish) {
        return
      }
      await resolveOptsPromise
      await publishProject(opts)
    },
    vite: resolveViteConfig(opts),
    rollup: resolveRollupConfig(opts),
    webpack: resovleWebpackConfig(opts),
  }
}

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory)
export default unplugin

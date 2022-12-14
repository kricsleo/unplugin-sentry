import { createUnplugin } from 'unplugin'
import type { Options } from './types'
import { defaults, resolveRollupConfig, resolveViteConfig, resovleWebpackConfig, logger } from './resolvers'
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

export default createUnplugin<Options | undefined>((options) => {
  const opts = Object.assign({}, defaultOptions, options)
  const resolveOptsPromise = getRelease(opts)
    .then(release => defaults(opts, { release }))
  
  return {
    name: 'unplugin-sentry',
    enforce: 'post',
    buildStart() {
      // @ts-ignore
      ['warn', 'error'].forEach(name => this && this[name] && (logger[name] = this[name].bind(this)))
    },
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    loadInclude(id) {
      return id === resolvedVirtualModuleId
    },
    async load(id) {
      if (id === resolvedVirtualModuleId) {
        await resolveOptsPromise
        return {
          code: getVirtualContent(opts),
          map: { version: 3, mappings: '', sources: [] } as any,
        }
      }
    },
    async writeBundle() {
      if(opts.publish) {
        await resolveOptsPromise
        await publishProject(opts)
      }
    },
    vite: resolveViteConfig(opts),
    rollup: resolveRollupConfig(opts),
    webpack: resovleWebpackConfig(opts),
  }
})


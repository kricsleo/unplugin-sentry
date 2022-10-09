import { createUnplugin } from 'unplugin'
import type { Options } from './types'
import { resolveRollupConfig, resolveViteConfig, resovleWebpackConfig } from './resolvers'

/**
 * Default options
 */
const defaultOptions: Partial<Options> = {
  finalize: true,
  cleanLocal: true,
  cleanArtifacts: true,
  shortRelease: true,
}

export default createUnplugin<Options | undefined>((options) => {
  const opts = Object.assign({}, defaultOptions, options)
  return {
    name: 'unplugin-sentry',
    enforce: 'post',
    vite: resolveViteConfig(opts),
    rollup: resolveRollupConfig(opts),
    webpack: resovleWebpackConfig(opts),
  }
})


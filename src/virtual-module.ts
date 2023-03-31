import { Options } from './types'

export const virtualModuleId = 'virtual-unplugin-sentry-runtime'
export const resolvedVirtualModuleId = `\0${virtualModuleId}`

export function getVirtualContent(options: Options): string {
  return `
    export const ORG = ${JSON.stringify(options.org)};
    export const PROJECT = ${JSON.stringify(options.project)};
    export const ENV = ${JSON.stringify(options.deploy?.env)};
    export const RELEASE = ${JSON.stringify(options.release)};
    export const DIST = ${JSON.stringify(options.sourcemap?.dist)};
    export const PUBLISH = ${JSON.stringify(options.publish)};
  `
}

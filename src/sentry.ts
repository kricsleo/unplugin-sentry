import path from 'path'
import util from 'util'
import SentryCli, { SentryCliUploadSourceMapsOptions } from '@sentry/cli'
import rimraf from 'rimraf'
import type { Options } from './types'

/** 
 * Release project,
 * deploy and upload sourcemap .etc.
 */
export async function publishProject(options: Options) {
  const { commits, cleanLocal, cleanArtifacts, finalize, deploy, silent } = options
  const release = options.release as string
  const sourcemap = options.sourcemap as SentryCliUploadSourceMapsOptions
  const cli = getSentryCli(options)

  // create a new release
  await cli.releases.new(release)

  // delete previous artifacts in the release
  cleanArtifacts && await cli.execute(
    ['releases', 'files', release, 'delete', '--all'],
    true,
  )

  // upload sourcemap
  if(sourcemap?.include.length) {
    await cli.releases.uploadSourceMaps(release, sourcemap)
  }

  // set commits
  const shouldCommit = commits?.auto || (commits?.repo && commits?.commit)
  shouldCommit && await cli.releases.setCommits(release, commits!)

  // finalize release
  finalize && await cli.releases.finalize(release)

  // set delploy
  // @ts-ignore
  await cli.releases.newDeploy(release, deploy)

  // delete sourcemap after all is done
  // support `include: string[]` only
  if(cleanLocal && sourcemap?.include.length) {
    if(sourcemap.include.some(dir => typeof dir !== 'string')) {
      throw new Error(`[UnpluginSentry]: When using "cleanLocal", the "include" must be an array of string.`)
    }
    const sourmapGlobs = (sourcemap.include as string[]).map(
      dir => path.resolve(process.cwd(), dir, './**/*.js.map'),
    )
    !silent && console.log(`[UnpluginSentry]: Cleaning local sourcemap ${sourmapGlobs}`)
    await Promise.all(sourmapGlobs.map(glob => deleteFile(glob)))
  }
}

/**
 * Mock SentryCli for dry run
 */
class DrySentryCli {
  options?: Options
  releases: any

  constructor(configFile?: string, options?: Options) {
    this.options = options
    this.releases = {
      proposeVersion: async () => {
        const cli = new SentryCli(configFile, options)
        const release = await cli.releases.proposeVersion()
        this.debug('Proposed release:\n', release)
        return release
      },
      new: (release: string) => {
        this.debug('Creating new release:\n', release)
        return Promise.resolve(release)
      },
      uploadSourceMaps: (release: string, config: any) => {
        this.debug('Calling upload-sourcemaps with:\n', config)
        return Promise.resolve(release)
      },
      finalize: (release: string) => {
        this.debug('Finalizing release:\n', release)
        return Promise.resolve(release)
      },
      setCommits: (release: string, config: any) => {
        this.debug('Calling set-commits with:\n', config)
        return Promise.resolve(release)
      },
      newDeploy: (release: string, config: any) => {
        this.debug('Calling deploy with:\n', config)
        return Promise.resolve(release)
      },
    }
  }

  execute(args: string[], _live: boolean): Promise<string> {
    this.debug('Calling excute with:\n', args)
    return Promise.resolve(args.toString())
  }

  debug(label: string, data?: any) {
    if(this.options?.silent) {
      return 
    }
    if (data !== undefined) {
      // eslint-disable-next-line no-console
      console.log(
        `[UnpluginSentry] ${label} ${util.inspect(
          data,
          false,
          null,
          true,
        )}`,
      )
    }
    else {
      // eslint-disable-next-line no-console
      console.log(`[UnpluginSentry] ${label}`)
    }
  }
}

/**
 * Get release version
 */
export async function getRelease(options: Options): Promise<string> {
  if(options.release) {
    return options.release.trim()
  } else {
    const cli = getSentryCli(options)
    const proposedRelease = await cli.releases.proposeVersion()
      .then(version => options.shortRelease ? version.slice(0, 8) : version)
      .catch((e) => {
        console.error(
          '[UnpluginSentry]: Failed to get a "release", ' 
          + 'no "release" config or "process.env.SENTRY_RELEASE" found, '
          + 'auto-detect also failed.', e)
        throw e
      })
    return proposedRelease
  }
}

/**
 * Get a sentry-cli instance.
 */
function getSentryCli(options: Options): SentryCli {
  return options.dryRun 
    ? new DrySentryCli(options.configFile, options)
    : new SentryCli(options.configFile, options)
}

/**
 * Delete files
 */
export function deleteFile(path: string) {
  return new Promise<void>((resolve, reject) => 
    rimraf(path, e => e ? reject(e) : resolve()
  ))
}

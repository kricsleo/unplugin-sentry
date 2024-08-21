import path from 'node:path'
import util from 'node:util'
import process from 'node:process'
import type { SentryCliUploadSourceMapsOptions } from '@sentry/cli'
import SentryCli from '@sentry/cli'
import rimraf from 'rimraf'
import type { DeployOptions, Options } from './types'
import { logger } from './resolvers'

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
  if (cleanArtifacts) {
    await cli.execute(
      ['releases', 'files', release, 'delete', '--all'],
      true,
    )
  }

  // upload sourcemap
  if (sourcemap?.include.length) {
    await cli.releases.uploadSourceMaps(release, sourcemap)
  }

  // set commits
  const shouldCommit = commits?.auto || (commits?.repo && commits?.commit)
  if (shouldCommit) {
    await cli.releases.setCommits(release, commits!)
  }

  // finalize release
  if (finalize) {
    await cli.releases.finalize(release)
  }

  // set delploy
  await cli.releases.newDeploy(release, deploy as Required<DeployOptions>)

  // delete sourcemap after all is done
  // support `include: string[]` only
  if (cleanLocal && sourcemap?.include.length) {
    if (sourcemap.include.some(dir => typeof dir !== 'string')) {
      throw new Error(`[UnpluginSentry]: When using "cleanLocal", the "include" must be an array of string.`)
    }
    const sourmapGlobs = (sourcemap.include as string[]).map(
      dir => [
        path.resolve(process.cwd(), dir, './**/*.js.map'),
        path.resolve(process.cwd(), dir, './**/*.css.map'),
      ],
    ).flat()
    if (!silent) {
      logger.log(`Cleaning local sourcemap\n  🧹${sourmapGlobs.join('\n  🧹')}`)
    }
    await rimraf(sourmapGlobs, { glob: true })
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
    if (this.options?.silent) {
      return
    }
    if (data !== undefined) {
      logger.log(
        `${label} ${util.inspect(
          data,
          false,
          null,
          true,
        )}`,
      )
    } else {
      logger.log(label)
    }
  }
}

/**
 * Get release version
 */
export async function getRelease(options: Options): Promise<string> {
  if (options.release) {
    return options.release.trim()
  } else {
    const cli = getSentryCli(options)
    const proposedRelease = await cli.releases.proposeVersion()
    return options.shortRelease
      ? proposedRelease.slice(0, 8)
      : proposedRelease
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

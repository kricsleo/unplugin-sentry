import path from 'path'
import util from 'util'
import SentryCli from '@sentry/cli'
import rimraf from 'rimraf'
import type { Options } from './types'

/**
 * Upload sourcemap with SentryCli
 */
export async function uploadSourcemap(options: Options) {
  const { sourcemap, commits, cleanLocal, cleanArtifacts, finalize, deploy, configFile, dryRun } = options
  let cli = new SentryCli(configFile, options)
  dryRun && (cli = new DrySentryCli(cli) as any)
  // if (!build.sourcemap) {
  //   this.warn('No sourcemap found, won\'t upload sourcemap.')
  //   return
  // }
  const release = await getRelease(options, cli)
  if (!release) {
    console.warn('[UnpluginSentry]: No `release` found, won\'t upload sourcemap.')
    return
  }
  // create a new release
  await cli.releases.new(release)
  // delete previous artifacts in the release
  cleanArtifacts && await cli.execute(
    ['releases', 'files', release, 'delete', '--all'],
    true,
  )
  // upload sourcemap(TODO: MAKE SURE INCLUDE AND URLPREFIX IS RIGHT)
  // @ts-expect-error include & urlPrefix
  await cli.releases.uploadSourceMaps(release, sourcemap)
  // set commits
  const shouldCommit = commits?.auto || (commits?.repo && commits?.commit)
  shouldCommit && await cli.releases.setCommits(release, commits!)
  // finalize release
  finalize && await cli.releases.finalize(release)
  // set delploy(todo: set deploy env)
  // @ts-expect-error env
  await cli.releases.newDeploy(release, deploy!)
  // delete sourcemap after all is done
  // support `include: string[]` only
  const sourmapGlobs = (sourcemap?.include as string[] || [process.cwd()]).map(
    dir => path.join(process.cwd(), dir, './**/*.js.map'),
  )
  console.warn(`[UnpluginSentry]: Cleaning local sourcemap ${sourmapGlobs}`)
  cleanLocal && await Promise.all(sourmapGlobs.map(glob => deleteFile(glob)))
}

/**
 * Mock SentryCli for dry run
 */
class DrySentryCli {
  releases: any
  constructor(cli: SentryCli) {
    this.releases = {
      proposeVersion: () =>
        cli.releases.proposeVersion().then((version) => {
          this.debug('Proposed version:\n', version)
          return version
        }),
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
    if (data !== undefined) {
      // eslint-disable-next-line no-console
      console.log(
        `[Sentry Webpack Plugin] ${label} ${util.inspect(
          data,
          false,
          null,
          true,
        )}`,
      )
    }
    else {
      // eslint-disable-next-line no-console
      console.log(`[Sentry Webpack Plugin] ${label}`)
    }
  }
}

/**
 * Get release version
 */
async function getRelease(options: Options, cli: SentryCli): Promise<string> {
  const { shortRelease } = options
  const specifiedRelease = options.release || process.env.SENTRY_RELEASE
  return specifiedRelease
    ? Promise.resolve(specifiedRelease.trim())
    : cli.releases.proposeVersion()
      .then(version => shortRelease ? version.slice(0, 8) : version)
      .catch((e) => {
        console.error('[UnpluginSentry]: Failed to auto-detect release https://docs.sentry.io/cli/releases/#creating-releases, ', e)
        return ''
      })
}

/**
 * Delete files
 */
export function deleteFile(path: string) {
  return new Promise<void>((resolve, reject) => rimraf(path, e => e ? reject(e) : resolve()))
}

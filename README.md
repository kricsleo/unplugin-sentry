<h1 align="center">unplugin-sentry</h1>

<p align="center">
<a href="https://www.npmjs.com/package/unplugin-sentry">
  <img src="https://img.shields.io/npm/v/unplugin-sentry?style=flat&colorA=18181B&colorB=F0DB4F" />
</a>

<a href="https://www.npmjs.com/package/unplugin-sentry">
  <img src="https://img.shields.io/npm/types/unplugin-sentry?style=flat&colorA=18181B&colorB=F0DB4F" />
</a>

<a href="https://github.com/kricsleo/unplugin-sentry/blob/master/LICENSE">
  <img src="https://img.shields.io/github/license/kricsleo/unplugin-sentry.svg?style=flat&colorA=18181B&colorB=F0DB4F" />
</a>
</p>

<h3 align="center">
All-in-one plugin for Sentry, supports webpack, vite, rollup, nuxt .ect.
</h3>
It's used to upload sourcemap and release your project to Sentry ([What's Sentry?](https://sentry.io/welcome/)).

## Features

- 🪜 Supports multiple bundlers and frameworks - including webpack, vite, rollup, nuxt and so on.
- ✨ Auto-detect configs depending on current environment - config as less as you need
- 🧹 Auto clean local soucemap files after upload (For security) - both `*.js.map` and `*.css.map`.
- 🍬 Optional runtime provided - easy to init Sentry at runtime.

## Install

```bash
npm i unplugin-sentry -D
```

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import unpluginSentry from 'unplugin-sentry/vite'

export default defineConfig({
  plugins: [
    unpluginSentry({ /* options */ }),
  ],
})
```

Example: [`playground/vite`](./playground/vite)

<br></details>

<details>
<summary>Rollup</summary><br>

```ts
// rollup.config.js
import unpluginSentry from 'unplugin-sentry/rollup'

export default {
  plugins: [
    unpluginSentry({ /* options */ }),
  ],
}
```

Example: [`playground/rollup`](./playground/rollup)

<br></details>

<details>
<summary>Webpack</summary><br>

```ts
// webpack.config.js
module.exports = {
  /* ... */
  plugins: [
    require('unplugin-sentry/webpack')({ /* options */ })
  ]
}
```

Example: [`playground/webpack`](./playground/webpack)

> This module works for Webpack >= 3

<br></details>

<details>
<summary>Nuxt</summary><br>

```ts
// nuxt.config.js
export default {
  buildModules: [
    ['unplugin-sentry/nuxt', { /* options */ }],
  ],
}
```

Example: [`playground/nuxt`](./playground/nuxt)

> This module works for both Nuxt 2 and [Nuxt Vite](https://github.com/nuxt/vite)

<br></details>

<details>
<summary>Vue CLI</summary><br>

```ts
// vue.config.js
module.exports = {
  configureWebpack: {
    plugins: [
      require('unplugin-sentry/webpack')({ /* options */ }),
    ],
  },
}
```

<br></details>

<details>
<summary>esbuild</summary><br>

I don't use esbuild for now, so it haven't been tested in esbuild yet.
(You can have a try and tell me if it works 👂. )

<br></details>

## Runtime Support

Besides uploading sourcemap to Sentry and other publishing works, this plugin also injects a virtual module named `virtual-unplugin-sentry-runtime` into your project.

It provides some useful meta info when initing Sentry at runtime. For example, when you call `Sentry.init({/** options **/})`, the `environment` and `release` options must match the one you use when uploading sourcemap. So that when debugging the issue in Sentry, the sourcemap can be correctly mapped.

```ts
import * as sentryMeta from 'virtual-unplugin-sentry-runtime'

console.log(sentryMeta)
// {
//   ORG: string
//   PROJECT: string
//   ENV: string
//   RELEASE: string
//   DIST: string
//   PUBLISH: boolean
// }
```

Need TS support for this runtime module? Just add the following config to your `tsconfig.json`.

```json
{
  "compilerOptions": {
    "types": ["unplugin-sentry/runtime"]
  }
}
```

## Options

Extends from [@sentry/cli - SentryCliOptions](https://github.com/getsentry/sentry-cli/blob/master/js/index.d.ts#L5).

| Prop            | Type      | Required | Default | Description                                                                                                            |
|-----------------|-----------|----------|---------|------------------------------------------------------------------------------------------------------------------------|
| url             | `string`  | ❌       | `https://sentry.io/`     | The URL of the Sentry instance you are connecting to. <br > This value will update `SENTRY_URL env variable.                                 |
| org             | `string`  | ❌       | -     | Organization slug. <br > This value will update `SENTRY_ORG` env variable.                                                                                                     |
| project         | `string`  | ❌       | -     | Project Project slug. <br > This value will update `SENTRY_PROJECT` env variable.                                                                                                 |
| authToken       | `string`  | ❌       | -     | Authentication token for API, interchangeable with apiKey. <br > This value will update `SENTRY_AUTH_TOKEN` env variable.                                                            |
| publish         | `boolean` | ❌       | `false` | If publish project to Sentry.<br > Means to upload soucemap files and release the version to Sentry server.<br > You might want to turn it on only when deploying projects other than locally developing.
| release         | `string`  | ❌       | -     | Release version.<br > Automatically generated from commit hash value if not provided.                                         |
| shortRelease    | `boolean` | ❌       | `true`  | If use short commit hash for automatically generated release version.                                                  |
| cleanLocal      | `boolean` | ❌       | `true`  | If remove local sourcemap files (`*.js.map` & `*.css.map`) after the publish.                                                                     |
| cleanArtifacts  | `boolean` | ❌       | `false` | If remove previous artifacts in the same release.                                                                      |
| sourcemap       | [`SourcemapOptions`](#sourcemapoptions) | ❌  | -     | Sourcemap options.                                                                                                     |
| deploy          | [`DeployOptions`](#deployoptions)    | ❌  | -     | Deploy options.                                                                                                        |
| commits         | [`CommitsOptions`](#commitsoptions)   | ❌  | -     | Commits options.                                                                                                       |
| finalize        | `boolean` | ❌       | `true`  | If finalize a release after the publish.                                                                               |
| silent          | `boolean` | ❌       | `false` | If true, all logs are suppressed.                                                                                      |
| dryRun          | `boolean` | ❌       | `false` | If attempts a dry run. <br > Usually used for debugging which mocks publishing.                                                                                              |
| configFile      | `string`  | ❌       | -     | Path of Sentry config file.                                                                                            |

#### SourcemapOptions

Extends from [@sentry/cli - SentryCliUploadSourceMapsOptions](https://github.com/getsentry/sentry-cli/blob/master/js/index.d.ts#L64).

| Prop                 | Type             | Required | Default     | Description                                                                                        |
|----------------------|------------------|----------|-------------|----------------------------------------------------------------------------------------------------|
| include              | `Array<string \| SourceMapsPathDescriptor>`  | ❌       | - <br > Auto-detectd from current bundler(webpack, vite, rollup and so on).       | One or more paths that Sentry CLI should scan recursively for sources. <br > It will upload all .map files and match associated .js files. <br > `type SourceMapsPathDescriptor = Omit<SourcemapOptions, 'include'> & { paths: string[] }`                     |
| urlPrefix            | `string`         | ❌       | - <br > Auto-detectd from current bundler(webpack, vite, rollup and so on).        | This sets an URL prefix at the beginning of all files. <br > This is also useful if your files are stored in a sub folder. **BUT REMEMBER TO START WITH `~/`.** eg: url-prefix `~/static/js`.                                           |
| urlSuffix            | `string`         | ❌       | -         | This sets an URL suffix at the end of all files. <br > Useful for appending query parameters.                                                  |
| ignore               | `string[]`       | ❌       | -         | One or more paths to ignore during upload. Overrides entries in ignoreFile file.                   |
| ignoreFile           | `string` \| `null` | ❌    | -         | Path to a file containing list of files/directories to ignore. <br > Can point to .gitignore or anything with same format.                                    |
| dist                 | `string`         | ❌       | -         | Unique identifier for the distribution, used to further segment your release. <br > Usually your build number.
| rewrite            | `boolean`                                   | ❌       | `true`    | Enables rewriting of matching sourcemaps so that indexed maps are flattened and missing sources are inlined if possible.                        |
| sourceMapReference | `boolean`                                   | ❌       | -       | This prevents the automatic detection of sourcemap references.                                                                                  |
| stripPrefix        | `string[]`                                  | ❌       | -       | When paired with the rewrite option this will remove a prefix from uploaded files. <br > For instance you can use this to remove a path that is build machine specific.                                                             |
| stripCommonPrefix  | `boolean`                                   | ❌       | -       | When paired with the rewrite option this will add ~ to the stripPrefix array.                                                                   |
| validate           | `boolean`                                   | ❌       | -       | This attempts sourcemap validation before upload when rewriting is not enabled. <br > It will spot a variety of issues with source maps and cancel the upload if any are found. <br > This is not enabled by default as this can cause false positives.                                                                |
| ext                | `string[]`                                  | ❌       | -       | This sets the file extensions to be considered. By default the following file extensions are processed: js, map, jsbundle and bundle.           |

#### DeployOptions

Extends from [@sentry/cli - SentryCliNewDeployOptions](https://github.com/getsentry/sentry-cli/blob/master/js/index.d.ts#L126).

| Prop      | Type      | Required | Default | Description                                                                                                       |
|-----------|-----------|----------|---------|-------------------------------------------------------------------------------------------------------------------|
| env       | `string`  | ❌       | - <br > Auto-detectd from current bundler(webpack, vite, rollup and so on) and use "process.env.NODE_ENV" as fallback.    | Environment for this release. Values that make sense here would be `production` or `staging`.                    |
| started   | `number` \| `string`  | ❌       | -     | Deployment start time in Unix timestamp (in seconds) or ISO 8601 format.                                         |
| finished  | `number` \| `string`  | ❌       | -     | Deployment finish time in Unix timestamp (in seconds) or ISO 8601 format.                                         |
| time      | `number`  | ❌       | -     | Deployment duration (in seconds). Can be used instead of started and finished.                                    |
| name      | `string`  | ❌       | -     | Human readable name for the deployment.                                                                           |
| url       | `string`  | ❌       | -     | URL that points to the deployment.                                                                                |

#### CommitsOptions

Extends from [@sentry/cli - SentryCliCommitsOptions](https://github.com/getsentry/sentry-cli/blob/master/js/index.d.ts#L153).

| Prop            | Type      | Required | Default | Description                                                                                                        |
|-----------------|-----------|----------|---------|--------------------------------------------------------------------------------------------------------------------|
| auto            | `boolean` | ❌       | -     | Automatically choose the associated commit (uses the current commit). Overrides other setCommit options.           |
| repo            | `string`  | ❌       | -     | The full repo name as defined in Sentry. Required if auto option is not true.                                      |
| commit          | `string`  | ❌       | -     | The current (last) commit in the release. Required if auto option is not true.                                     |
| previousCommit  | `string`  | ❌       | -     | The commit before the beginning of this release. <br > If omitted, this will default to the last commit of the previous release in Sentry. <br > If there was no previous release, the last 10 commits will be used.                                                                |
| ignoreMissing   | `boolean` | ❌       | -     | When the flag is set and the previous release commit was not found in the repository, will create a release. <br > with the default commits count(or the one specified with `--initial-depth`) instead of failing the command.     |
| ignoreEmpty     | `boolean` | ❌       | -     | When the flag is set, command will not fail and just exit silently if no new commits for a given release are found.|

## License

[MIT](./LICENSE) License © 2021-Present [kricsleo](https://github.com/kricsleo)

# unplugin-sentry

[![NPM version](https://img.shields.io/npm/v/unplugin-sentry?color=a1b858&label=)](https://www.npmjs.com/package/unplugin-sentry)

All-in-one plugin for Sentry, supports webpack, vite, rollup, nuxt .ect.

It's used to upload sourcemap or release your project to Sentry ([What's Sentry?](https://sentry.io/welcome/)).

You might also refer official plugin: [@sentry/webpack-plugin](https://github.com/getsentry/sentry-webpack-plugin), but it's just for webpack. Besides, this one-in-all plugin provides more useful features.

## Features

- 📦 Supports multiple bundlers and frameworks, including webpack, vite, rollup, nuxt and so on.
- ✨ Auto-detect configs depending on current environment.
- 🧹 Auto clean local soucemap files after upload (For security).
- 🍬 Optional runtime provided, easy to init Sentry at runtime.

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
//   PROJECT: string
//   ORG: string
//   ENV: string
//   RELEASE: string
//   ... // more to come
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

Much like [@sentry/webpack-plugin](https://github.com/getsentry/sentry-webpack-plugin), but provides more options.

| Option   | Type     | Required | Default | Description                                                                      |
| -------- | -------- | -------- | ------- |-------------------------------------------------------------------------------- |
| publish  | `boolean` | optional | `false` | If publish project to Sentry(Release, deploy, upload sourcemap and so on.) You may only want to turn it on when deploying and off when developing locally.                                             |
| cleanLocal   | `boolean` | optional | `true` | Delete local sourcemap files after uploaded to Sentry.        |


```ts
import type { SentryCliCommitsOptions, SentryCliNewDeployOptions, SentryCliOptions, SentryCliUploadSourceMapsOptions } from '@sentry/cli'

/** options */
export interface Options extends SentryCliOptions {
  /**
   * The URL of the Sentry
   */
  url: string
  /**
   * Orgination name in Sentry
   */
  org: string
  /**
   * Project name in Senrty
   */
  project: string
  /**
   * Auth token
   */
  authToken: string
  /**
   * Release version,
   * auto generated by commit hash,
   * you can also config it by yourself
   */
  release?: string
  /**
   * If use short commit hash for release version
   * @default true
   */
  shortRelease?: boolean
  /**
   * If publish project,
   * means upload soucemap and record deploy info .etc.
   * You might want to turn it on just during deploying but not locally developing
   * @default false
   */
  publish?: boolean
  /**
   * Sourcemap configs
   */
  sourcemap?: SourcemapOptions
  /**
   * Deploy configs
   */
  deploy?: DeployOptions
  /**
   * If delete local sourcemap after the publish,
   * @default true
   */
  cleanLocal?: boolean
  /**
   * If Remove all previous artifacts in the same release.
   * @default false
   */
  cleanArtifacts?: boolean
  /**
   * If finalize a release after the publish
   * @default true
   */
  finalize?: boolean
  /**
   * Path of config file
   */
  configFile?: string
  /**
   * Commits configs
   */
  commits?: SentryCliCommitsOptions
  /**
   * If attempts a dry run.
   * Usually used for debugging which mocks the publish work
   * @default false
   */
  dryRun?: boolean
}

export interface SourcemapOptions extends Omit<SentryCliUploadSourceMapsOptions, 'include'> {
  /**
   * Sourcemap paths
   * Auto-detect(You can provide it when it's wrong)
   */
  include?: SentryCliUploadSourceMapsOptions['include']
  /**
   * !IMPORTANT!: MUST START WITH `~/` if you don't want to set the domain
   * Auto-detect(You can provide it when it's wrong)
   */
  urlPrefix?: SentryCliUploadSourceMapsOptions['urlPrefix']
}

export interface DeployOptions extends Omit<SentryCliNewDeployOptions, 'env'> {
  /**
   * Environment
   * Auto-detect and use "process.env.NODE_ENV" as fallback
   */
  env?: SentryCliNewDeployOptions['env']
}
```


## License

[MIT](./LICENSE) License © 2021-Present [kricsleo](https://github.com/kricsleo)

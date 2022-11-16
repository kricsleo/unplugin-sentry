# unplugin-sentry

[![NPM version](https://img.shields.io/npm/v/unplugin-sentry?color=a1b858&label=)](https://www.npmjs.com/package/unplugin-sentry)

All-in-one plugin for Sentry, supports webpack, vite, rollup, nuxt .ect.

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

Example: [`playground/`](./playground/vite)

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

Example: [`playground/`](./playground/rollup)

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

Example: [`playground/`](./playground/webpack)

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

Example: [`playground/`](./playground/nuxt)

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

Haven't tested it yet.

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

For TS support, add the following config to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["unplugin-sentry/runtime"]
  }
}
```

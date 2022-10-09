# unplugin-sentry

[![NPM version](https://img.shields.io/npm/v/unplugin-sentry?color=a1b858&label=)](https://www.npmjs.com/package/unplugin-sentry)

Plugin for Sentry, support webpack & vite & rollup.

## Install

```bash
npm i unplugin-sentry
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

Example: [`playground/`](./playground/)

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

Support for `esbuild` is welcome!(I'll do it later.)

import unpluginSentry from '../../dist/rollup'

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH

export default {
  input: 'src/index.js',
  output: {
    format: 'iife',
    sourcemap: 'hidden',
    dir: 'dist',
  },
  plugins: [
    unpluginSentry({
      url: 'https://sentry.io/',
      org: 'kricsleo',
      project: 'demo',
      authToken: 'xxxxxx',
      publish: production,
      cleanLocal: false,
      dryRun: true,
    }),
  ],
}

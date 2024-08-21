import process from 'node:process'
import { defineConfig } from 'vite'
// eslint-disable-next-line antfu/no-import-dist
import unpluginSentry from '../../dist/vite'

export default defineConfig({
  plugins: [
    unpluginSentry({
      url: 'https://sentry.io/',
      org: 'kricsleo',
      project: 'demo',
      authToken: 'xxxx',
      publish: process.env.NODE_ENV === 'production',
      cleanLocal: false,
      dryRun: true,
    }),
  ],
  server: {
    open: true,
  },
})

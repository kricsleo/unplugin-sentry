import { defineConfig } from 'vite'
import unpluginSentry from '../../dist/vite'

export default defineConfig({
  plugins: [
    unpluginSentry({
      url: 'https://sentry.io/',
      org: 'kricsleo',
      project: 'demo',
      authToken: 'xxxxxx',
      publish: process.env.NODE_ENV === 'production',
      cleanLocal: false,
      dryRun: true,
    }),
  ],
  server: {
    open: true
  }
})

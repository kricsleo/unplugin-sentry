import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import Unplugin from '../../src/vite'
import { options } from '../../local.test'

export default defineConfig({
  plugins: [
    Inspect(),
    Unplugin(options),
  ],
  build: {
    sourcemap: true,
  },
})

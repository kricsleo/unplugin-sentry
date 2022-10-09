import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import Unplugin from '../../dist/rollup'
import { options } from '../../local.test'

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH

export default {
  input: 'src/main.js',
  output: {
    format: 'iife', // immediately-invoked function expression — suitable for <script> tags
    sourcemap: true,
    dir: 'dist',
  },
  plugins: [
    resolve(), // tells Rollup how to find date-fns in node_modules
    commonjs(), // converts date-fns to ES modules
    production && terser(), // minify, but only in production
    Unplugin({
      ...options,
      deploy: {
        env: 'production',
      },
    }),
  ],
}

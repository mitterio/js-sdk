import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'
import camelCase from 'lodash.camelcase'
import typescript from 'rollup-plugin-typescript2'
import json from 'rollup-plugin-json'
import builtins from 'rollup-plugin-node-builtins'
import globals from 'rollup-plugin-node-globals'

const pkg = require('./package.json')

const libraryName = 'mitter-core'

export default {
  input: `src/${libraryName}.ts`,
  output: [
    { file: pkg.main, name: camelCase(libraryName), format: 'umd', sourcemap: true },
    { file: pkg.module, format: 'es', sourcemap: true },
  ],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: [
      'websocket',
      'axios',
      'sockjs-client',
      'query-string',
      'nanoid'
  ],
  watch: {
    include: ['src/**', 'node_modules']
  },
  plugins: [
    // Allow json resolution
    json(),
    commonjs({
      ignoreGlobals: true
    }),
    globals(),
    builtins(),
    // Allow node_modules resolution, so you can use 'external' to control
    // Compile TypeScript files
    typescript({ useTsconfigDeclarationDir: true }),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    resolve(),
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage

    // Resolve source maps to the original source
    sourceMaps(),
  ],
}

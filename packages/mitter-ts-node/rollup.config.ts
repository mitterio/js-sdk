import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'
import camelCase from 'lodash.camelcase'
import typescript from 'rollup-plugin-typescript2'
import json from 'rollup-plugin-json'
import builtins from 'rollup-plugin-node-builtins'
import globals from 'rollup-plugin-node-globals'

const pkg = require('./package.json')

const libraryName = 'mitter-node'

export default {
  input: `src/${libraryName}.ts`,
  output: [
    {
      file: pkg.main,
      name: camelCase(libraryName),
      format: 'cjs',
      sourcemap: true,
      outro: 'module.exports = Object.assign({}, module.exports, exports)'
    },
    { file: pkg.module, format: 'es', sourcemap: true },
  ],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: [
    'websocket',
    'sockjs-client',
    'axios',
    'crypto'
  ],
  watch: {
    include: [
      'src/**',
      './../mitter-ts-core/dist/**',
      './../mitter-ts-models/dist/**'
    ]
  },
  plugins: [
    globals(),
    resolve(),
    builtins(),
    // Allow json resolution
    // Compile TypeScript files
    typescript({ useTsconfigDeclarationDir: true }),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),

    json(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage

    // Resolve source maps to the original source
    sourceMaps()
  ],
}

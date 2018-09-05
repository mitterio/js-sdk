import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'
import camelCase from 'lodash.camelcase'
import typescript from 'rollup-plugin-typescript2'
import json from 'rollup-plugin-json'
import builtins from 'rollup-plugin-node-builtins'
import globals from 'rollup-plugin-node-globals'
import replace from 'rollup-plugin-replace'

const pkg = require('./package.json')

const libraryName = 'mitter-web'

export default {
  input: `src/${libraryName}.ts`,
  output: [
    { file: pkg.main, name: camelCase(libraryName), format: 'umd', sourcemap: true },
    { file: pkg.module, format: 'es', sourcemap: true },
  ],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: [
    'websocket'
  ],
  watch: {
    include: ['src/**', 'node_modules']
  },
  plugins: [
    replace({
        'process.version.': '"v9.5.0".',
        delimiters: ['', '']
    }),


    resolve({
        browser: true,
        jsnext: true
    }),

    commonjs(),

    globals(),
    json(),

    builtins(),

    typescript({ useTsconfigDeclarationDir: true }),

    // Resolve source maps to the original source
    sourceMaps()
  ]
}

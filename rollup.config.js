import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from "rollup-plugin-terser";
import pkg from './package.json';

export default {
  input: 'lib/index.ts',
  output: {
    format: 'cjs',
    name: 'index',
    file: 'dist/index.js',
    banner: "/* @preserve skinview3d / MIT License / https://github.com/bs-community/skinview3d */",
  },
  external: [...Object.keys(pkg.dependencies || {}), 'events'],
  plugins: [
    resolve({ preferBuiltins: true }),
    typescript({}),
    commonjs(),
    terser(),
  ],
};

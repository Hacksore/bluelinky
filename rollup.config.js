import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

export default {
  input: 'src/index.ts',
  output: {
    format: 'cjs',
    name: 'index',
    file: 'dist/index.js',
    banner: '/* @preserve bluelinky / MIT License / https://github.com/Hacksore/bluelinky */',
  },
  external: [...Object.keys(pkg.dependencies || {}), 'events'],
  plugins: [
    resolve({ preferBuiltins: true }),
    typescript({}),
    commonjs(),
    terser(),
  ],
};

import { readFileSync } from 'fs';
import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
// import pkg from './package.json';
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));


export default {
  input: 'src/index.ts',
  output: [
    {
      format: 'cjs',
      name: 'index',
      file: 'dist/index.js',
      exports: 'named',
      banner: '/* @preserve bluelinky / MIT License / https://github.com/Hacksore/bluelinky */',
    },
    {
      format: 'esm',
      name: 'index',
      exports: 'named',
      file: 'dist/index.esm.js',
      banner: '/* @preserve bluelinky / MIT License / https://github.com/Hacksore/bluelinky */',
    },
  ],
  external: [...Object.keys(pkg.dependencies || {}), 'events', 'url', 'fs', 'util'],
  plugins: [
    resolve({ preferBuiltins: true }),
    typescript({}),
    commonjs(),
    terser(),
  ],
};

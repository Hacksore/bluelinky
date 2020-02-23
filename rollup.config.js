import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import license from 'rollup-plugin-license';
import builtins from 'rollup-plugin-node-builtins';
import commonjs from 'rollup-plugin-commonjs';
import minify from 'rollup-plugin-babel-minify';
import pkg from './package.json';
import fs from 'fs';
const licenseText = fs.readFileSync(__dirname + '/LICENSE');

export default {
	input: 'lib/index.ts',
	output:	{
		format: 'cjs',
		name: 'index',
		file: 'dist/index.js'
	},
  external: [
		...Object.keys(pkg.dependencies || {}),
		'events'
  ],
	plugins: [
		builtins(),
		resolve({ preferBuiltins: true }),
		typescript({
		}),
		minify(),
		commonjs(),
		license({
			banner: `
				bluelinky (https://github.com/hacksore/bluelinky)

				${licenseText}
				`
		})
	]
};

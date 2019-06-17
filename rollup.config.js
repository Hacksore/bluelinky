import typescript from "rollup-plugin-typescript2";
import resolve from "rollup-plugin-node-resolve";
import license from "rollup-plugin-license";
import builtins from 'rollup-plugin-node-builtins';
import pkg from './package.json'

export default {
	input: "lib/bluelinky.ts",
	output: {
    format: "cjs",
    name: "bluelinky",
    file: "dist/bluelinky.js"
  },
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
	plugins: [
		resolve({ preferBuiltins: true }),
    typescript(),
    builtins(),
		license({
			banner: `
				bluelinky (https://github.com/hacksore/bluelinky)

				MIT License
				`
		})
	]
};

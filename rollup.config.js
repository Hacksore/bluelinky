import { uglify } from "rollup-plugin-uglify";
import typescript from "rollup-plugin-typescript2";
import resolve from "rollup-plugin-node-resolve";
import license from "rollup-plugin-license";
import builtins from 'rollup-plugin-node-builtins';

const base = {
	input: "lib/bluelinky.ts",
	output: [
		{
			format: "umd",
			name: "bluelinky",
			file: "dist/bluelinky.js",
			indent: "\t",
		},
		{
			format: "es",
			file: "dist/bluelinky.module.js",
			indent: "\t"
		}
  ],

	external: [
    "got",
    "form-data"
  ],
	plugins: [
		resolve({ preferBuiltins: true }),
    typescript({
      tsconfig: "tsconfig.json"
    }),
    builtins(),
		license({
			banner: `
				bluelinky (https://github.com/hacksore/bluelinky)

				MIT License
				`
		})
	]
};

export default [
	base,
	Object.assign({}, base, {
		output: Object.assign({}, base.output[0], { file: "dist/bluelinky.min.js" }),
		plugins: (() => {
			const plugin = base.plugins.slice();
			plugin.splice(1, 0, uglify());
			return plugin;
		})()
	})
];

import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";

/** @type {import('rollup').InputOptions[]} */
const config = [
  {
    input: "src/index.ts",
    output: [
      { file: "lib/index.js", format: "cjs", exports: "auto" },
      { file: "lib/index.es.js", format: "esm" },
    ],
    plugins: [
      resolve(),
      typescript({ declaration: true, declarationDir: "lib/types" }),
    ],
    external: [/^preact\/?/],
  },
  {
    input: "lib/types/index.d.ts",
    output: {
      file: "lib/index.d.ts",
      format: "esm",
    },
    plugins: [dts()],
  },
];

export default config;

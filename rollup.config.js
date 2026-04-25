import fs from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import dts from "rollup-plugin-dts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const isWatch = process.env.ROLLUP_WATCH === 'true';

export default () => {
  clearDir("dist");

  const configs = [
    // ESM for bundlers (Vite, webpack, etc.)
    {
      input: "src/index.ts",
      output: {
        file: "dist/index.mjs",
        format: "esm",
        sourcemap: false,
        generatedCode: "es2015",
        hoistTransitiveImports: false,
      },
      plugins: [
        typescript({
          compilerOptions: {
            declaration: true,
            declarationDir: "dist/.dts",
            rootDir: "src",
            removeComments: true,
          },
        }),
      ],
    },
    // CJS for require() / older tooling
    {
      input: "src/index.ts",
      output: {
        file: "dist/index.js",
        format: "cjs",
        sourcemap: false,
        generatedCode: "es2015",
        hoistTransitiveImports: false,
      },
      plugins: [
        typescript({
          compilerOptions: { declaration: false, removeComments: true },
        }),
      ],
    },
    // UMD minified browser build for CDN / <script> tag usage
    {
      input: "src/index.ts",
      output: {
        file: "dist/index.umd.js",
        format: "umd",
        name: "CanvasTextParticle",
        sourcemap: false,
        generatedCode: "es2015",
      },
      plugins: [
        typescript({
          compilerOptions: { declaration: false, removeComments: true },
        }),
        terser({
          ecma: 2015,
          keep_fnames: true,
          compress: { sequences: false },
        }),
      ],
    },
  ];

  // Skip dts bundling in watch mode — dist/.dts is cleaned up after each build
  // which breaks the next watch cycle. Types are not needed during development.
  if (!isWatch) {
    configs.push({
      input: "dist/.dts/index.d.ts",
      output: { file: "dist/index.d.ts", format: "esm" },
      plugins: [
        dts(),
        {
          name: "cleanup-dts",
          writeBundle() {
            fs.rmSync(join(__dirname, "dist/.dts"), {
              recursive: true,
              force: true,
            });
          },
        },
      ],
    });
  }

  return configs;
};

/**
 * @type {function(string): void}
 * @description Deletes the specified directory and all its contents if it exists.
 * @param {string} dir - The name of the directory to clear (relative to the project root).
 */
function clearDir(dir) {
  const dirPath = join(__dirname, dir);
  if (dir && fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

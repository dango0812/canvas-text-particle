import pluginJs from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
import noForOfArray from "eslint-plugin-no-for-of-array";
import prettier from "eslint-plugin-prettier/recommended";
import tseslint from "typescript-eslint";

export default defineConfig(
  {
    ignores: ["dist", "node_modules", "**/*.d.ts"],
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "no-for-of-array": noForOfArray,
    },
    rules: {
      "no-implicit-coercion": "error",
      eqeqeq: ["error", "always", { null: "ignore" }],
      curly: ["error", "all"],
      "no-warning-comments": [
        "warn",
        { terms: ["TODO", "FIXME", "XXX", "BUG"], location: "anywhere" },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: 'CallExpression[callee.object.name="console"]',
          message: "console.log() is not allowed in source code.",
        },
      ],
      "no-for-of-array/no-for-of-array": "error",

      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { ignoreRestSiblings: true, caughtErrors: "none" },
      ],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/array-type": ["error", { default: "array-simple" }],
      "@typescript-eslint/no-inferrable-types": "warn",
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE", "PascalCase"],
          leadingUnderscore: "allow",
        },
        { selector: "function", format: ["camelCase", "PascalCase"] },
        { selector: "interface", format: ["PascalCase"] },
        { selector: "typeAlias", format: ["PascalCase"] },
      ],
      "@typescript-eslint/member-ordering": [
        "error",
        {
          default: [
            "public-static-field",
            "private-static-field",
            "public-instance-field",
            "private-instance-field",
            "public-constructor",
            "private-constructor",
            "public-instance-method",
            "private-instance-method",
          ],
        },
      ],
    },
  },
  prettier,
);

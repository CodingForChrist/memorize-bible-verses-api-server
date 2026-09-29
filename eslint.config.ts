import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import unicorn from "eslint-plugin-unicorn";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js, tseslint: tseslint.plugin, unicorn },
    extends: ["js/recommended", "tseslint/recommended", "unicorn/recommended"],
    languageOptions: { globals: globals.node },
    rules: {
      "tseslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
        },
      ],
    },
  },
]);

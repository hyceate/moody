import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import * as graphqlEslint from "@graphql-eslint/eslint-plugin"
import prettier from "eslint-plugin-prettier";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: ["**/dist", "**/.eslintrc.cjs"],
}, ...fixupConfigRules(
    compat.extends(
        "eslint:recommended", "plugin:@typescript-eslint/recommended")
    ), {
    plugins: {
        "@typescript-eslint": fixupPluginRules(typescriptEslint),
        "@graphql-eslint": fixupPluginRules(graphqlEslint),
        prettier: fixupPluginRules(prettier),
    },

    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.node,
        },

        parser: tsParser,
    },
    rules: {
        "no-debugger": 0,
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "prettier/prettier": ["error", {
            singleQuote: true,
            endOfLine: "auto",
        }],
    },
}, {
    files: ["**/*.js"],

    rules: {
        "@typescript-eslint/no-var-requires": "off",
    },
}];
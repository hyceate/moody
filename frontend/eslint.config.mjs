import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import react from 'eslint-plugin-react';
import reactRefresh from 'eslint-plugin-react-refresh';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-plugin-prettier';
import tailwindcss from 'eslint-plugin-tailwindcss';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: ['**/dist', '**/.eslintrc.cjs'],
  },
  ...fixupConfigRules(
    compat.extends(
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:react/recommended',
      'plugin:react/jsx-runtime',
      'plugin:react-hooks/recommended',
      'plugin:@tanstack/eslint-plugin-query/recommended',
      'plugin:prettier/recommended',
      'plugin:tailwindcss/recommended',
      'prettier',
    ),
  ),
  {
    plugins: {
      react: fixupPluginRules(react),
      'react-refresh': reactRefresh,
      'react-hooks': fixupPluginRules(reactHooks),
      prettier: fixupPluginRules(prettier),
      tailwindcss: fixupPluginRules(tailwindcss),
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },

      parser: tsParser,
    },

    rules: {
      'comma-dangle': 0,
      'import/no-cycle': 'off',
      'no-alert': 0,
      'no-await-in-loop': 0,
      'import/prefer-default-export': 0,
      'import/extensions': 0,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/comma-dangle': ['off'],
      'react/jsx-props-no-spreading': 'off',
      '@typescript-eslint/no-debugger': 0,
      '@typescript-eslint/no-use-before-define': 'off',

      '@typescript-eslint/no-unused-vars': [
        0,
        {
          ignoreRestSiblings: true,
          argsIgnorePattern: 'res|next|^err|^_',
          varsIgnorePattern: '^_',
        },
      ],

      'react-refresh/only-export-components': [
        'warn',
        {
          allowConstantExport: true,
        },
      ],

      '@typescript-eslint/no-explicit-any': 'off',

      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          endOfLine: 'auto',
        },
      ],

      'tailwindcss/no-custom-classname': 0,
    },
  },
];

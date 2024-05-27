module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true, jest: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "plugin:prettier/recommended",
    "plugin:@tanstack/eslint-plugin-query/recommended",
    "prettier"
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  plugins: ["react-refresh", "prettier", "react-hooks"],
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
        // Broken in TypeSCript.Want this turned on
        // destructuredArrayIgnorePattern: '^_',
      },
    ],
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
    "@typescript-eslint/no-explicit-any": 'off',
    quotes: [
      2,
      'single',
      {
        avoidEscape: true,
        allowTemplateLiterals: true,
      },
    ],
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        endOfLine: 'auto',
      },
    ],
  },
};

module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint","@graphql-eslint","prettier"],
  rules: {
    "no-debugger": 0,
    quotes: [
      2,
      "single",
      {
        avoidEscape: true,
        allowTemplateLiterals: true,
      },
    ],
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "prettier/prettier": [
      1,
      {
        singleQuote: true,
        endOfLine: "auto",
      },
    ],
  },
  overrides: [
    {
      files: ["**/*.js"],
      rules: {
        "@typescript-eslint/no-var-requires": "off", // Disable this rule for JavaScript files
      },
    },
  ],
};

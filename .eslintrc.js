module.exports =  {
  parser: '@typescript-eslint/parser',
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  parserOptions: {
    ecmaVersion:  2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    '@typescript-eslint/no-empty-function': 0
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
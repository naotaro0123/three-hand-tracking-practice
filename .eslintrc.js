module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    project: './tsconfig.json'
  },
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended',
    'prettier',
  ],
  plugins: [
    'prettier',
  ],
  env: {
    'browser': true,
    'node': true,
    'es6': true,
    'jest': true
  },
   // add your custom rules here
  rules: {
  }
}

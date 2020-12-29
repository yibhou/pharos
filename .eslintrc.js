module.exports = {
  root: true,
  extends: [
    'react-app',
    'react-app/jest',
    'standard',
    'standard-jsx',
    'standard-react'
    // 'standard-with-typescript'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'jsx-quotes': ['error', 'prefer-double'],
    'import/no-anonymous-default-export': 'off',
    'prefer-const': 'warn',
    'no-unused-vars': 'warn',
    'no-return-assign': 'warn',
    'one-var': 'off',
    'quote-props': 'off',
    'dot-notation': 'off',
    'default-case': 'off',
    'lines-between-class-members': 'off',
    'space-before-function-paren': ['warn', 'never'],
    'prefer-promise-reject-errors': 'off',
    'semi': 'off',
    'no-use-before-define': 'off',
    '@typescript-eslint/semi': ['warn', 'never'],
    '@typescript-eslint/no-use-before-define': ['warn', 'nofunc'],
    '@typescript-eslint/explicit-function-return-type': 'off'
  },
  env: {
    node: true,
    browser: true
  },
  parserOptions: {
    project: './tsconfig.json'
  }
}

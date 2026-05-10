const globals = require('globals');

module.exports = [
  {
    files: ['**/*.js'],

    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',

      globals: {
        ...globals.browser,
        chrome: 'readonly'
      }
    },

    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single'],

      'no-unused-vars': 'error',
      'no-undef': 'error',
      'no-unreachable': 'error',

      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],

      'no-var': 'error',
      'prefer-const': 'error',

      'consistent-return': 'error',
      'no-shadow': 'error',

      'default-case': 'warn',
      'no-console': 'warn',

      'eol-last': ['error', 'always']
    }
  }
];

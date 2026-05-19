const globals = require('globals');
const yml = require('eslint-plugin-yml');
const yamlParser = require('yaml-eslint-parser');

module.exports = [
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'node_modules/**',
      '*.min.js',
    ],
  },
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        chrome: 'readonly',
      },
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
      'eol-last': ['error', 'always'],
    },
  },
  {
    files: ['build.js', '*.cjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      'no-unused-vars': 'error',
      'no-undef': 'error',
      'eol-last': ['error', 'always'],
    },
  },
  {
    files: ['**/*.yml', '**/*.yaml'],
    plugins: {
      yml,
    },
    languageOptions: {
      parser: yamlParser,
    },
    rules: {
      'yml/no-empty-document': 'error',
      'yml/no-irregular-whitespace': 'error',
      'yml/quotes': ['error', { prefer: 'single' }],
      'eol-last': ['error', 'always'],
    },
  }
];

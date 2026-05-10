module.exports = [
  {
    files: ['**/*.js'],

    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',

      globals: {
        chrome: 'readonly',
        document: 'readonly',
        window: 'readonly'
      }
    },

    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single']
    }
  }
];
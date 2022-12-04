module.exports = {
  overrides: [
    {
      files: ['*.test.ts', '__mocks__/*.ts'],
      rules: {
        'import/first': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'import/order': 'warn',
      },
    },
  ],
};

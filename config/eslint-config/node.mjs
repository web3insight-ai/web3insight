import baseConfig from './base.mjs';

/**
 * ESLint flat config for Node/NestJS services.
 * Extends base + relaxes a few rules NestJS DI patterns need.
 */
export default [
  ...baseConfig,
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
    },
  },
  {
    ignores: ['test/**'],
  },
];

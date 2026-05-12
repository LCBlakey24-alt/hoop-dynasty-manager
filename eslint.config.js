import js from '@eslint/js';

export default [
  {
    ignores: ['dist/**'],
  },
  {
    files: ['**/*.js'],
    ...js.configs.recommended,
  },
];

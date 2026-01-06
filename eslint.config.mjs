import eslintForAi from 'eslint-for-ai';

export default [
  ...eslintForAi.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
  {
    ignores: ['ralph', 'node_modules/**'],
  },
];

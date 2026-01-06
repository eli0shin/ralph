import eslintForAi from 'eslint-for-ai';

export default [
  ...eslintForAi.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['eslint.config.mjs'],
        },
      },
    },
  },
  {
    ignores: ['ralph', 'node_modules/**'],
  },
];

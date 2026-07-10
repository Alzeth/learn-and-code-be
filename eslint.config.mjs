// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'dist/**', 'node_modules/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // TypeScript
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', ignoreRestSiblings: true }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports', fixStyle: 'separate-type-imports' }],
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // Comments — none allowed
      'no-warning-comments': ['error', { terms: ['todo', 'fixme', 'hack', 'xxx', 'note'], location: 'anywhere' }],
      'no-inline-comments': 'error',
      'multiline-comment-style': ['error', 'starred-block'],
      'spaced-comment': ['error', 'never'],

      // NestJS conventions
      'no-console': 'error',

      // Imports
      'sort-imports': 'off',
      'simple-import-sort/imports': ['error', {
        groups: [
          ['^\\u0000'],   // side-effect imports
          ['^@?\\w'],     // external packages
          ['^src/'],      // absolute src/ imports
          ['^\\.'],       // relative imports
        ],
      }],
      'simple-import-sort/exports': 'error',

      // Prettier
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
);

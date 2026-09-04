import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist/**', 'coverage/**', '.angular/**', 'node_modules/**', '*.config.js'] },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  prettier,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always'],
      // Los Validators de Angular son funciones estaticas sin `this`, disenadas
      // para pasarse por referencia; la regla no puede distinguirlo.
      '@typescript-eslint/unbound-method': 'off',
    },
  },
  {
    files: ['**/*.spec.ts'],
    rules: { '@typescript-eslint/no-unsafe-assignment': 'off' },
  },
);

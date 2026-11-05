import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import unusedImports from 'eslint-plugin-unused-imports'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'unused-imports': unusedImports,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      // Replaced by unused-imports/*, which can auto-remove unused imports.
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': 'error',
      // The project does not use PropTypes.
      'react/prop-types': 'off',
      // Components are mostly anonymous arrows wrapped in memo().
      'react/display-name': 'off',
      // En spaces are used on purpose in track separators/templates.
      'no-irregular-whitespace': [
        'error',
        { skipComments: true, skipJSXText: true, skipStrings: true },
      ],
      // Use getLogger from src/logger.js instead.
      'no-console': 'error',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  {
    files: ['vite.config.js'],
    languageOptions: { globals: globals.node },
  },
  {
    // The logger itself, the vendored Mopidy.js console fallback, and tests.
    files: ['src/logger.js', 'src/mopidy-js/mopidy-js.js', '**/*.test.js'],
    rules: { 'no-console': 'off' },
  },
]

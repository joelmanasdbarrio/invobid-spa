import js from '@eslint/js'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      react.configs.flat.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // Disable rules that might interfere with TypeScript type checking
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      // React 17+ JSX transform - no need to import React
      'react/react-in-jsx-scope': 'off',
      // Formatting rules - using base ESLint rules since stylistic rules were moved
      'semi': ['error', 'never'],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'comma-dangle': ['error', 'never'],
      'space-before-function-paren': ['error', 'always'],
      // Indentation rules
      'indent': ['error', 2, { SwitchCase: 1 }],
      // React rules
      'react/self-closing-comp': 'error',
      // Disallow multiple spaces in JSX props and in general
      'react/jsx-props-no-multi-spaces': 'error',
      'no-multi-spaces': ['error', { ignoreEOLComments: false }],
      // Enforce closing tag location and consistent JSX indentation
      'react/jsx-closing-tag-location': 'error',
      'react/jsx-closing-bracket-location': ['error', { nonEmpty: 'line-aligned' }],
      'react/jsx-indent': ['error', 2],
      'react/jsx-indent-props': ['error', 2],
      'react/jsx-first-prop-new-line': ['error', 'multiline'],
      // Disallow trailing spaces
      'no-trailing-spaces': 'error',
      // Enforce newline at end of file
      'eol-last': ['error', 'always'],
      // Enforce single quotes in JSX attributes
      'jsx-quotes': ['error', 'prefer-single']
    },
  },
])

import typescriptEslint from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import react from 'eslint-plugin-react'

export default [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'dist/**',
      'drizzle/**',
      '*.js'
    ]
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      'react': react
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
      // Disable rules that might interfere with TypeScript type checking
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      // Formatting rules - using base ESLint rules since stylistic rules were moved
      'semi': ['error', 'never'],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'comma-dangle': ['error', 'never'],
      'space-before-function-paren': ['error', 'always'],
      // Indentation rules
      'indent': ['error', 2, { SwitchCase: 1 }],
      // React rules
      'react/self-closing-comp': 'error'
    }
  }
]

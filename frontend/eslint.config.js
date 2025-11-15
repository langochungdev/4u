import vueParser from 'vue-eslint-parser'
import vuePlugin from 'eslint-plugin-vue'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'

export default [
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: { ts: tsParser },
        ecmaVersion: 'latest',
        sourceType: 'module',
        vueFeatures: {
          template: false, // Tắt kiểm tra template
        },
      },
    },
    plugins: { vue: vuePlugin },
    rules: {
      'vue/*': 'off', // Tắt toàn bộ rule của Vue (template)
    },
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
]

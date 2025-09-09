import pluginNext from '@next/eslint-plugin-next'

export default defineConfig([
  {
    plugins: {
      '@next/next': pluginNext
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      ...pluginNext.configs.recommended.rules
    }
  }
])
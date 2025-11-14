//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  ...tanstackConfig,
  {
    ignores: [
      '**/vite.config.ts',
      '**/vitest.config.ts',
      '**/prettier.config.js',
      '**/eslint.config.js',
      '**/postcss.config.js',
      '**/tailwind.config.ts',
      '**/tailwind.config.js',
    ],
  },
]

// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: 'var(--sds-color-brand-800)',
        'brand-hover': 'var(--sds-color-brand-900)',
      },
      fontFamily: {
        sans: ['var(--sds-typography-family-sans)', 'ui-sans-serif'],
        mono: ['var(--sds-typography-family-mono)', 'ui-monospace'],
      },
    },
  },
};

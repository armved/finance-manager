/**
 * Design tokens for JavaScript contexts.
 *
 * Use these wherever CSS classes can't reach:
 *   - Recharts (stroke, fill, colors array)
 *   - Canvas / WebGL
 *   - Inline styles driven by dynamic values
 *   - Anything that needs a resolved color string at runtime
 *
 * Values are CSS variable references, so they stay in sync with theme.css
 * automatically. For a resolved hex/rgb string at runtime, use resolveToken().
 */

export const tokens = {
  colors: {
    // Surfaces
    background:      'var(--background)',
    surface:         'var(--surface)',
    surfaceRaised:   'var(--surface-raised)',
    surfaceOverlay:  'var(--surface-overlay)',

    // Text
    foreground:       'var(--foreground)',
    mutedForeground:  'var(--muted-foreground)',

    // Brand
    primary:            'var(--primary)',
    primaryForeground:  'var(--primary-foreground)',

    // Chrome
    border: 'var(--border)',
    ring:   'var(--ring)',

    // Finance domain — use these in charts and transaction rows
    income:         'var(--income)',
    incomeSubtle:   'var(--income-subtle)',
    expense:        'var(--expense)',
    expenseSubtle:  'var(--expense-subtle)',
    transfer:       'var(--transfer)',
    transferSubtle: 'var(--transfer-subtle)',

    // Status
    destructive: 'var(--destructive)',
  },

  // Convenience: chart series colors in declaration order.
  // Recharts <Pie> / <Bar> can iterate this array.
  chartSeries: [
    'var(--primary)',
    'var(--income)',
    'var(--transfer)',
    'var(--expense)',
    'var(--muted-foreground)',
  ],
} as const

/**
 * Resolves a CSS variable to its computed value at runtime.
 * Use this when a third-party library needs an actual color string (hex/rgb),
 * not a var() reference.
 *
 * @example
 *   resolveToken('--income')  // → "oklch(65% 0.195 145)" or whatever the browser resolves
 */
export function resolveToken(variable: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim()
}

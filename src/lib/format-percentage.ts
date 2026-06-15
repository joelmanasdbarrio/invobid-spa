const percentageFormatters = new Map<string, Intl.NumberFormat>()

/**
 * Format a percentage amount using the user's locale.
 *
 * @param amount   - Numeric amount in percentage points (e.g. 1.23 means 1.23%)
 * @param locale   - BCP 47 locale string (e.g. "es-ES", "en-US")
 * @returns Formatted percentage string (e.g. "1,23 %" for es-ES, "1.23%" for en-US)
 */
export function formatPercentage (amount: number, locale?: string): string {
  const key = locale ?? 'default'

  if (!percentageFormatters.has(key)) {
    percentageFormatters.set(key, new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 2
    }))
  }

  // Intl percent format expects a ratio, but app values are percentage points.
  return percentageFormatters.get(key)!.format(amount / 100)
}

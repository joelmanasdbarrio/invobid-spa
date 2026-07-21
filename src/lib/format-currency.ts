const currencyFormatters = new Map<string, Intl.NumberFormat>()

/**
 * Format a monetary amount using the user's locale and an ISO 4217 currency code.
 *
 * @param amount   - Numeric amount
 * @param locale   - BCP 47 locale string (e.g. "es-ES", "en-US")
 * @param currency - ISO 4217 currency code (e.g. "EUR", "USD"). Defaults to "EUR".
 * @returns Formatted currency string (e.g. "1.234,56 €" for es-ES/EUR, "$1,234.56" for en-US/USD)
 */
export function formatCurrency (amount: number, locale?: string, currency: string = 'EUR'): string {
  const key = `${locale}-${currency}`
  if (!currencyFormatters.has(key)) {
    currencyFormatters.set(key, new Intl.NumberFormat(locale, { style: 'currency', currency }))
  }
  return currencyFormatters.get(key)!.format(amount)
}

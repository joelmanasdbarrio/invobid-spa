/**
 * Format a date-only value for display using the user's locale.
 * Uses `timeZone: 'UTC'` to prevent off-by-one day shifts for users west of UTC.
 *
 * @param date - A date string ("yyyy-MM-dd") or Date object (UTC midnight)
 * @param locale - BCP 47 locale string (e.g. "es-ES", "en-US")
 * @returns Formatted date string (e.g. "31/10/2026" for es-ES, "10/31/2026" for en-US)
 */
export function formatDate (date: string | Date, locale: string): string {
  const d = typeof date === 'string' ? parseDateOnly(date) : date
  return new Intl.DateTimeFormat(locale, {
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(d)
}

/**
 * Format an absolute datetime value (from a timestamptz field) for display.
 * Renders in the user's local timezone, not UTC — since timestamptz represents
 * a specific moment in time, it should be shown in the user's own timezone.
 *
 * @param date - An ISO datetime string or Date object
 * @param locale - BCP 47 locale string (e.g. "es-ES", "en-US")
 * @returns Formatted datetime string (e.g. "31/10/2026, 14:00" for es-ES)
 */
export function formatDateTime (date: string | Date, locale: string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d)
}

/**
 * Convert a local Date object to a "yyyy-MM-dd" string using local date parts.
 * Unlike `toISOString().split('T')[0]`, this uses `.getFullYear()/.getMonth()/.getDate()`
 * so the result matches the calendar date the user selected — no UTC shift.
 *
 * @param date - A Date object
 * @returns A "yyyy-MM-dd" string
 */
export function toDateOnlyString (date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Parse a "yyyy-MM-dd" string into a Date at UTC midnight.
 * This avoids the off-by-one day bug caused by `new Date("yyyy-MM-dd")` which,
 * per the JS spec, already parses as UTC midnight — but this is explicit and safe.
 *
 * @param dateStr - A "yyyy-MM-dd" string
 * @returns A Date object representing UTC midnight of that date
 */
export function parseDateOnly (dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00Z')
}

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
    month: 'short',
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
 * Intended for display via `formatDate` (which formats in UTC to avoid day shifts).
 * Do NOT use this for calendar picker state — use `parseLocalDate` instead.
 *
 * @param dateStr - A "yyyy-MM-dd" string
 * @returns A Date object representing UTC midnight of that date
 */
export function parseDateOnly (dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00Z')
}

/**
 * Parse a "yyyy-MM-dd" string into a Date at local midnight.
 * Use this for calendar picker state so react-day-picker highlights the correct day
 * regardless of the user's timezone offset.
 *
 * @param dateStr - A "yyyy-MM-dd" string
 * @returns A Date object representing local midnight of that date
 */
export function parseLocalDate (dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/**
 * Parse an ISO datetime string (or any string accepted by `new Date()`) into a Date.
 * Returns `undefined` when the string is empty or not parseable, instead of an
 * invalid Date object.
 *
 * @param value - An ISO datetime string (e.g. "2026-04-10T14:30:00.000Z")
 * @returns A valid Date object, or undefined
 */
export function parseDateTime (value: string): Date | undefined {
  const d = new Date(value)
  return isNaN(d.getTime()) ? undefined : d
}

/**
 * Format a Date as "HH:mm" using local hours and minutes.
 * Intended for use as the `value` prop of `<input type="time">`, which requires
 * exactly this format. Do NOT use `formatDateTime` for this — it produces a
 * locale-dependent string that is not valid for time inputs.
 *
 * @param date - A Date object
 * @returns A "HH:mm" string in the user's local timezone
 */
export function toTimeString (date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

/**
 * Format a millisecond duration as a human-readable countdown string.
 * Omits the days segment when zero, and the hours segment when both days and hours are zero.
 *
 * @param ms - Duration in milliseconds (negative values are treated as 0)
 * @returns e.g. "2d 3h 4m 5s", "3h 4m 5s", or "4m 5s"
 */
export function formatCountdown (ms: number): string {
  const rem = Math.max(0, ms)
  const d = Math.floor(rem / 86_400_000)
  const h = Math.floor((rem % 86_400_000) / 3_600_000)
  const m = Math.floor((rem % 3_600_000) / 60_000)
  const s = Math.floor((rem % 60_000) / 1_000)
  return d > 0 ? `${d}d ${h}h ${m}m ${s}s` : h > 0 ? `${h}h ${m}m ${s}s` : m > 0 ? `${m}m ${s}s` : `${s}s`
}

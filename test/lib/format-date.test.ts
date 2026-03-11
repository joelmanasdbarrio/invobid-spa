import {
  formatDate,
  formatDateTime,
  parseDateOnly,
  parseDateTime,
  parseLocalDate,
  toDateOnlyString,
  toTimeString
} from '@/lib/format-date'
import { describe, expect, it } from 'vitest'

// ---------------------------------------------------------------------------
// parseLocalDate — must produce local midnight in ALL timezones
// ---------------------------------------------------------------------------
describe('parseLocalDate', () => {
  it('returns the correct local year/month/date regardless of timezone', () => {
    const d = parseLocalDate('2026-04-10')
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(3) // 0-indexed → April
    expect(d.getDate()).toBe(10)
  })

  it('sets hours/minutes/seconds to 0 (local midnight)', () => {
    const d = parseLocalDate('2026-04-10')
    expect(d.getHours()).toBe(0)
    expect(d.getMinutes()).toBe(0)
    expect(d.getSeconds()).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// parseDateOnly — must produce UTC midnight
// ---------------------------------------------------------------------------
describe('parseDateOnly', () => {
  it('returns UTC midnight for the given date string', () => {
    const d = parseDateOnly('2026-04-10')
    expect(d.getUTCFullYear()).toBe(2026)
    expect(d.getUTCMonth()).toBe(3) // 0-indexed → April
    expect(d.getUTCDate()).toBe(10)
    expect(d.getUTCHours()).toBe(0)
    expect(d.getUTCMinutes()).toBe(0)
    expect(d.getUTCSeconds()).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// toDateOnlyString — uses local getters, must round-trip with parseLocalDate
// ---------------------------------------------------------------------------
describe('toDateOnlyString', () => {
  it('round-trips with parseLocalDate', () => {
    expect(toDateOnlyString(parseLocalDate('2026-04-10'))).toBe('2026-04-10')
  })

  it('uses local getters (new Date(year, month, day) constructor)', () => {
    expect(toDateOnlyString(new Date(2026, 3, 10))).toBe('2026-04-10')
  })

  it('pads single-digit month and day', () => {
    expect(toDateOnlyString(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

// ---------------------------------------------------------------------------
// formatDate — timezone-safe display (uses timeZone: 'UTC' internally)
// The formatted output must be stable regardless of the process timezone.
// ---------------------------------------------------------------------------
describe('formatDate', () => {
  describe('string input', () => {
    it('formats "yyyy-MM-dd" string correctly for es-ES', () => {
      expect(formatDate('2026-04-10', 'es-ES')).toBe('10/04/2026')
    })

    it('formats "yyyy-MM-dd" string correctly for en-US', () => {
      expect(formatDate('2026-04-10', 'en-US')).toBe('04/10/2026')
    })

    it('does not shift the date for a UTC-midnight Date (UTC display guard)', () => {
      // parseDateOnly gives UTC midnight — formatDate must NOT shift it to the
      // previous day for users in UTC− timezones
      expect(formatDate('2026-01-01', 'en-US')).toBe('01/01/2026')
    })
  })

  describe('Date object input', () => {
    it('formats a UTC-midnight Date object correctly for es-ES', () => {
      const d = parseDateOnly('2026-04-10') // UTC midnight
      expect(formatDate(d, 'es-ES')).toBe('10/04/2026')
    })
  })
})

// ---------------------------------------------------------------------------
// formatDateTime — renders in local timezone (for timestamptz fields)
// We can't assert the exact time string without knowing the test-runner TZ,
// so we just verify it includes the date parts and doesn't throw.
// ---------------------------------------------------------------------------
describe('formatDateTime', () => {
  describe('ISO string input (auction columns path)', () => {
    it('returns a non-empty string without throwing', () => {
      const result = formatDateTime('2026-04-10T14:30:00.000Z', 'es-ES')
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('includes the year 2026 in the output', () => {
      const result = formatDateTime('2026-04-10T14:30:00.000Z', 'en-US')
      expect(result).toContain('2026')
    })
  })

  describe('Date object input', () => {
    it('returns a non-empty string for a Date input', () => {
      const d = new Date('2026-04-10T14:30:00.000Z')
      const result = formatDateTime(d, 'en-US')
      expect(typeof result).toBe('string')
      expect(result).toContain('2026')
    })
  })
})

// ---------------------------------------------------------------------------
// parseDateTime — parses ISO strings with NaN guard
// ---------------------------------------------------------------------------
describe('parseDateTime', () => {
  it('returns a valid Date for a well-formed ISO string', () => {
    const d = parseDateTime('2026-04-10T14:30:00.000Z')
    expect(d).toBeInstanceOf(Date)
    expect(d!.getUTCFullYear()).toBe(2026)
  })

  it('returns undefined for an empty string', () => {
    expect(parseDateTime('')).toBeUndefined()
  })

  it('returns undefined for a non-date string', () => {
    expect(parseDateTime('not-a-date')).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// toTimeString — formats local HH:mm for <input type="time">
// ---------------------------------------------------------------------------
describe('toTimeString', () => {
  it('returns "HH:mm" using local hours and minutes', () => {
    const d = new Date(2026, 3, 10, 14, 5, 0) // local 14:05
    expect(toTimeString(d)).toBe('14:05')
  })

  it('pads single-digit hours and minutes with a leading zero', () => {
    const d = new Date(2026, 3, 10, 9, 3, 0) // local 09:03
    expect(toTimeString(d)).toBe('09:03')
  })

  it('returns "00:00" for midnight', () => {
    const d = new Date(2026, 3, 10, 0, 0, 0)
    expect(toTimeString(d)).toBe('00:00')
  })
})

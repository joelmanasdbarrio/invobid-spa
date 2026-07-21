import { formatPercentage } from '@/lib/format-percentage'

describe('formatPercentage', () => {
  it('formats percentage-point values for es-ES', () => {
    expect(formatPercentage(1.23, 'es-ES')).toBe('1,23\u00a0%')
  })

  it('formats percentage-point values for en-US', () => {
    expect(formatPercentage(1.23, 'en-US')).toBe('1.23%')
  })

  it('formats integer percentage points without scaling errors', () => {
    expect(formatPercentage(1, 'en-US')).toBe('1.0%')
  })

  it('keeps fractional percentage points', () => {
    expect(formatPercentage(0.5, 'en-US')).toBe('0.5%')
  })

  it('shows one decimal for zero percentage points', () => {
    expect(formatPercentage(0, 'en-US')).toBe('0.0%')
  })
})


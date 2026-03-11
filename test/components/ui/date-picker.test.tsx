import { DatePicker } from '@/components/ui/date-picker'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// DatePicker uses useLocale() which reads from LocaleContext.
// We mock the hook so tests don't need the full provider tree.
vi.mock('@/hooks/use-locale', () => ({
  default: () => ({ locale: 'es-ES', setLocale: vi.fn() })
}))

describe('DatePicker', () => {
  it('shows the placeholder when no value is provided', () => {
    render(<DatePicker placeholder='Pick a date' />)
    expect(screen.getByRole('button')).toHaveTextContent('Pick a date')
  })

  it('displays the correct localized date for the given value (es-ES)', () => {
    render(<DatePicker value='2026-04-10' />)
    // es-ES format: dd/mm/yyyy
    expect(screen.getByRole('button')).toHaveTextContent('10/04/2026')
  })

  it('does not shift the date to the previous day for UTC-midnight input', () => {
    // This is the core timezone-safety test: April 10 must display as April 10,
    // not April 9 (which would happen if UTC midnight leaked into local rendering)
    render(<DatePicker value='2026-01-01' />)
    expect(screen.getByRole('button')).toHaveTextContent('01/01/2026')
  })

  it('is disabled when disabled prop is true', () => {
    render(<DatePicker value='2026-04-10' disabled />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('calls onChange with undefined when Limpiar is clicked', () => {
    const onChange = vi.fn()
    render(<DatePicker value='2026-04-10' onChange={onChange} />)
    // open the popover — only the trigger button exists at this point
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByRole('button', { name: /limpiar/i }))
    expect(onChange).toHaveBeenCalledWith(undefined)
  })

  it('accepts minDate and maxDate props without error', () => {
    expect(() =>
      render(<DatePicker minDate='2026-04-01' maxDate='2026-06-30' />)
    ).not.toThrow()
  })
})

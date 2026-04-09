import { DateTimePicker } from '@/components/ui/date-time-picker'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/hooks/use-locale', () => ({
  useLocale: () => ({ locale: 'es-ES', setLocale: vi.fn() })
}))

describe('DateTimePicker', () => {
  it('shows placeholder when no value is provided', () => {
    render(<DateTimePicker placeholder='Pick a datetime' />)
    expect(screen.getByRole('button')).toHaveTextContent('Pick a datetime')
  })

  it('displays a formatted datetime for the given ISO value', () => {
    // Use noon UTC — the year 2026 appears regardless of the test runner timezone
    render(<DateTimePicker value='2026-04-10T12:00:00.000Z' />)
    expect(screen.getByRole('button')).toHaveTextContent('2026')
  })

  it('renders a non-empty display text (not the placeholder) when a value is set', () => {
    render(
      <DateTimePicker
        value='2026-04-10T12:00:00.000Z'
        placeholder='Pick a datetime'
      />
    )
    expect(screen.getByRole('button')).not.toHaveTextContent('Pick a datetime')
  })

  it('is disabled when disabled prop is true', () => {
    render(<DateTimePicker value='2026-04-10T12:00:00.000Z' disabled />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('calls onChange with undefined when Limpiar is clicked', () => {
    const onChange = vi.fn()
    render(<DateTimePicker value='2026-04-10T12:00:00.000Z' onChange={onChange} />)
    // open the popover — only the trigger button exists at this point
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByRole('button', { name: /limpiar/i }))
    expect(onChange).toHaveBeenCalledWith(undefined)
  })

  it('accepts minDate and maxDate props without error', () => {
    expect(() =>
      render(<DateTimePicker minDate='2026-04-01' maxDate='2026-06-30' />)
    ).not.toThrow()
  })
})

import { DateTimeRangePicker } from '@/components/ui/date-time-range-picker'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/hooks/use-locale', () => ({
  useLocale: () => ({ locale: 'es-ES', setLocale: vi.fn() })
}))

describe('DateTimeRangePicker', () => {
  it('shows placeholder when no dates are provided', () => {
    render(<DateTimeRangePicker placeholder='Pick a range' />)
    expect(screen.getByRole('button')).toHaveTextContent('Pick a range')
  })

  it('displays formatted from datetime when only fromValue is set', () => {
    render(<DateTimeRangePicker fromValue='2026-04-10T12:00:00.000Z' />)
    expect(screen.getByRole('button')).toHaveTextContent('2026')
  })

  it('renders a non-empty display text (not the placeholder) when fromValue is set', () => {
    render(
      <DateTimeRangePicker
        fromValue='2026-04-10T12:00:00.000Z'
        placeholder='Pick a range'
      />
    )
    expect(screen.getByRole('button')).not.toHaveTextContent('Pick a range')
  })

  it('is disabled when disabled prop is true', () => {
    render(
      <DateTimeRangePicker
        fromValue='2026-04-10T12:00:00.000Z'
        toValue='2026-04-20T12:00:00.000Z'
        disabled
      />
    )
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('calls both onChange handlers with undefined when Limpiar is clicked', () => {
    const onFromChange = vi.fn()
    const onToChange = vi.fn()
    render(
      <DateTimeRangePicker
        fromValue='2026-04-10T12:00:00.000Z'
        toValue='2026-04-20T12:00:00.000Z'
        onFromChange={onFromChange}
        onToChange={onToChange}
      />
    )
    // open the popover — only the trigger button exists at this point
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByRole('button', { name: /limpiar/i }))
    expect(onFromChange).toHaveBeenCalledWith(undefined)
    expect(onToChange).toHaveBeenCalledWith(undefined)
  })

  it('accepts minDate and maxDate props without error', () => {
    expect(() =>
      render(
        <DateTimeRangePicker
          minDate='2026-04-01'
          maxDate='2026-06-30'
        />
      )
    ).not.toThrow()
  })
})

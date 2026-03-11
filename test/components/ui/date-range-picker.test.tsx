import { DateRangePicker } from '@/components/ui/date-range-picker'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/hooks/use-locale', () => ({
  default: () => ({ locale: 'es-ES', setLocale: vi.fn() })
}))

describe('DateRangePicker', () => {
  it('shows placeholder when no dates are provided', () => {
    render(<DateRangePicker onFromChange={vi.fn()} onToChange={vi.fn()} />)
    expect(screen.getByRole('button')).toHaveTextContent('Selecciona un rango')
  })

  it('displays the from date when only fromDate is provided', () => {
    render(
      <DateRangePicker fromDate='2026-04-10' onFromChange={vi.fn()} onToChange={vi.fn()} />
    )
    expect(screen.getByRole('button')).toHaveTextContent('10/04/2026')
  })

  it('displays "from - to" range when both dates are set', () => {
    render(
      <DateRangePicker
        fromDate='2026-04-10'
        toDate='2026-04-20'
        onFromChange={vi.fn()}
        onToChange={vi.fn()}
      />
    )
    expect(screen.getByRole('button')).toHaveTextContent('10/04/2026 - 20/04/2026')
  })

  it('does not shift dates to the previous day (timezone safety)', () => {
    // Jan 1 and Dec 31 are boundary dates that would shift in UTC− timezones
    // if parsed as UTC midnight instead of local midnight
    render(
      <DateRangePicker
        fromDate='2026-01-01'
        toDate='2026-12-31'
        onFromChange={vi.fn()}
        onToChange={vi.fn()}
      />
    )
    expect(screen.getByRole('button')).toHaveTextContent('01/01/2026 - 31/12/2026')
  })

  it('calls both onChange handlers with undefined when Limpiar is clicked', () => {
    const onFromChange = vi.fn()
    const onToChange = vi.fn()
    render(
      <DateRangePicker
        fromDate='2026-04-10'
        toDate='2026-04-20'
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
        <DateRangePicker
          minDate='2026-04-01'
          maxDate='2026-06-30'
          onFromChange={vi.fn()}
          onToChange={vi.fn()}
        />
      )
    ).not.toThrow()
  })
})

import CreateAuctionPage from '@/pages/user/auctions/create-auction/page'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Canonical cross-layer test dataset — must match:
 *   invobid-api: src/app/auction/auction.service.spec.ts (create — price validation)
 *   invobid-spa: test/lib/calculate-max-price.test.ts
 *
 * invoiceAmount=5000, buyerPct=1%, sellerPct=2%, minDiscount=10%
 * totalWithFees = 5000 + (5000 × 3/100) = 5150
 * MAX_ALLOWED_PRICE = 5150 × 0.9 = 4635
 */
const MAX_ALLOWED_PRICE = 4635

vi.mock('@/hooks/use-loggedInUser', () => ({
  default: () => ({ loggedInUser: { id: 'user-1', type: 'INVESTOR' }, setLoggedInUser: vi.fn() })
}))

vi.mock('@/hooks/use-locale', () => ({
  useLocale: () => ({ locale: 'es-ES', setLocale: vi.fn() })
}))

vi.mock('@/services/invoice.api', () => ({
  getInvoices: vi.fn().mockResolvedValue({
    data: [{
      id: 'inv-1',
      svc: 'FAC-001',
      amount: 5000,
      currency: 'EUR',
      dueDate: '2027-06-01',
      status: 'verified',
      rating: 80,
      transactionFee: { buyerPercentage: 1, sellerPercentage: 2 },
      sellerInvestor: { id: 'user-1' },
      auctions: [],
      documents: [],
      debtor: { id: 'debtor-1', name: 'Test Debtor' },
      createdAt: '',
      updatedAt: '',
      deletedAt: ''
    }]
  })
}))

vi.mock('@/services/auction.api', () => ({
  createAuction: vi.fn().mockResolvedValue({ data: { id: 'auction-1' } })
}))

function renderPage () {
  return render(
    <MemoryRouter>
      <CreateAuctionPage />
    </MemoryRouter>
  )
}

/**
 * Wait for the 300ms debounce to fire and for `getInvoices` to resolve.
 * Uses real timers — adds ~350ms per test but avoids React 19 / fake-timer deadlock.
 */
async function loadInvoices () {
  await new Promise<void>(resolve => setTimeout(resolve, 350))
}

/** Open the invoice Select via keyboard and choose the canonical test invoice. */
async function selectTestInvoice () {
  const trigger = screen.getByRole('combobox')
  fireEvent.focus(trigger)
  // Radix Select opens on ArrowDown when the trigger is focused
  fireEvent.keyDown(trigger, { key: 'ArrowDown', code: 'ArrowDown' })
  await act(async () => {})

  // findByRole retries until the option appears (invoices may still be loading)
  const option = await screen.findByRole('option', { name: /FAC-001/i })
  await act(async () => { fireEvent.click(option) })
}

beforeEach(() => {
  vi.stubEnv('VITE_MINIMUM_INVOICE_DISCOUNT', '10')
  // Radix UI pointer event APIs not available in jsdom
  Element.prototype.scrollIntoView = vi.fn()
  Element.prototype.hasPointerCapture = vi.fn()
  Element.prototype.setPointerCapture = vi.fn()
  Element.prototype.releasePointerCapture = vi.fn()
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('CreateAuctionPage', () => {
  it('renders without crashing', () => {
    expect(() => renderPage()).not.toThrow()
  })

  it('price input is disabled before an invoice is selected', () => {
    renderPage()
    // Use placeholder to target the price input specifically (discount input has a different placeholder)
    expect(screen.getByPlaceholderText('1000')).toBeDisabled()
  })

  it('shows the max allowed price hint after selecting an invoice', async () => {
    renderPage()
    await loadInvoices()
    await selectTestInvoice()

    // Max price hint should now be visible: "Máximo: 4.635,00 €" (es-ES format)
    await waitFor(() => {
      expect(screen.getByText(/M\u00e1ximo/i)).toBeInTheDocument()
    })
  })

  it('shows a validation error when the entered price exceeds the maximum', async () => {
    renderPage()
    await loadInvoices()
    await selectTestInvoice()

    const priceInput = screen.getByPlaceholderText('1000')
    await waitFor(() => expect(priceInput).not.toBeDisabled())

    fireEvent.change(priceInput, { target: { valueAsNumber: MAX_ALLOWED_PRICE + 1 } })
    fireEvent.blur(priceInput)

    await waitFor(() => {
      expect(screen.getByText(/supera el m\u00e1ximo permitido/i)).toBeInTheDocument()
    })
  })

  it('caps the price at the maximum when a large custom discount is applied', async () => {
    renderPage()
    await loadInvoices()
    await selectTestInvoice()

    const priceInput = screen.getByPlaceholderText('1000')
    await waitFor(() => expect(priceInput).not.toBeDisabled())

    // Discount of 2% → 5000 × 0.98 = 4900 > 4635 → must be capped to 4635
    const [discountInput] = screen.getAllByPlaceholderText(/descuento/i)
    await act(async () => {
      fireEvent.change(discountInput, { target: { value: '2' } })
    })

    await waitFor(() => {
      expect(Number((priceInput as HTMLInputElement).value)).toBe(MAX_ALLOWED_PRICE)
    })
  })
})

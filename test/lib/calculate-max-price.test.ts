import { calculateMaxAllowedPrice } from '@/lib/calculate-max-price'

/**
 * Cross-layer alignment tests.
 * The canonical dataset below must match the backend unit test in
 * invobid-api/src/app/auction/auction.service.spec.ts (create — price validation).
 *
 * invoiceAmount=5000, buyerPct=1%, sellerPct=2%, minDiscount=10%
 * totalWithFees = 5000 + (5000 × 3/100) = 5150
 * maxAllowedPrice = 5150 × 0.9 = 4635
 */
describe('calculateMaxAllowedPrice', () => {
  it('cross-layer alignment: 5000 / 1% buyer / 2% seller / 10% min discount → 4635', () => {
    expect(calculateMaxAllowedPrice(5000, 1, 2, 10)).toBe(4635)
  })

  it('zero fees: only invoice amount and discount applied → 4500', () => {
    // 5000 × 0.9 = 4500
    expect(calculateMaxAllowedPrice(5000, 0, 0, 10)).toBe(4500)
  })

  it('high discount: 20% minimum discount → 4120', () => {
    // (5000 + 5000 × 3/100) × 0.8 = 5150 × 0.8 = 4120
    expect(calculateMaxAllowedPrice(5000, 1, 2, 20)).toBe(4120)
  })

  it('accepts string inputs from API decimal fields', () => {
    // API returns Decimal column values as strings — must produce same result
    expect(calculateMaxAllowedPrice('5000', '1', '2', '10')).toBe(4635)
  })
})

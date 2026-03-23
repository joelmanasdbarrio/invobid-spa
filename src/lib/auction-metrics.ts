/**
 * Auction metrics — formulas kept in sync with the backend (auction.service.ts).
 *
 * discount       = ((invoiceAmount - price) / invoiceAmount) * 100
 * profitability  = ((invoiceAmount * (1 - buyerPct/100) - price) / price) * 100
 */

export function calcDiscount (invoiceAmount: number, price: number): number {
  if (invoiceAmount <= 0) return 0
  return ((invoiceAmount - price) / invoiceAmount) * 100
}

export function calcProfitability (invoiceAmount: number, buyerPercentage: number, price: number): number {
  if (invoiceAmount <= 0 || price <= 0) return 0
  return ((invoiceAmount * (1 - buyerPercentage / 100) - price) / price) * 100
}

/** Inverse of calcProfitability — returns the price that achieves a given profitability target. */
export function invertProfitability (invoiceAmount: number, buyerPercentage: number, targetProfitability: number): number {
  return (invoiceAmount * (1 - buyerPercentage / 100)) / (1 + targetProfitability / 100)
}

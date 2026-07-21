/**
 * Calculates the maximum allowed starting price for an auction.
 *
 * Formula: (invoiceAmount + fees) × (1 − minimumDiscount / 100)
 *
 * All parameters accept strings to handle Decimal fields returned from the API.
 * Must stay in sync with AuctionService.calculateMaxAllowedPrice() in invobid-api.
 */
export function calculateMaxAllowedPrice (
  invoiceAmount: number | string,
  buyerPercentage: number | string,
  sellerPercentage: number | string,
  minimumDiscount: number | string
): number {
  const amount = Number(invoiceAmount)
  const buyerPct = Number(buyerPercentage)
  const sellerPct = Number(sellerPercentage)
  const minDiscount = Number(minimumDiscount)
  const totalFeePercentage = buyerPct + sellerPct
  const totalFeeAmount = (amount * totalFeePercentage) / 100
  const invoiceWithFees = amount + totalFeeAmount
  return Math.round(invoiceWithFees * (1 - minDiscount / 100) * 100) / 100
}

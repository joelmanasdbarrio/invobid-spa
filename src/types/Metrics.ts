/**
 * Metric response types matching MetricService return shapes
 * These types ensure type safety when consuming metric data in dashboard components
 */

/** i1: Account balance (availableBalance + reservedBalance) */
export type AccountBalanceMetric = {
  availableBalance: number
  reservedBalance: number
}

/** i2: Total invested volume */
export type TotalInvestedVolumeMetric = number

/** i3: Total invested invoices count */
export type TotalInvestedCountMetric = number

/** i5: Average profitability */
export type AverageProfitabilityMetric = number

/** i6: Year profitability */
export type YearProfitabilityMetric = number

/** i7: Next year expected profitability */
export type NextYearExpectedProfitabilityMetric = number

/** i9: Participated auctions count */
export type AuctionParticipationCountMetric = number

/** i10: Auction success rate */
export type AuctionSuccessRateMetric = number

/** i11: Upcoming invoices due within next 30 days */
export type UpcomingInvoiceMetric = {
  id: string
  svc: string
  amount: number
  dueDate: string
  debtorCompanyName: string
  currency?: string // Optional as service may not include it
}

/** i14: Risk distribution by rating level */
export type RiskDistributionMetric = {
  rating: number
  invoiceCount: number
  totalAmount: number
}

/** i15: Average portfolio rating */
export type AverageRatingMetric = number

/** i16: Top debtors by invested volume */
export type TopDebtorMetric = {
  debtorId: string
  companyName: string
  invoiceCount: number
  totalAmount: number
  averageRating: number
}

/** i17: Portfolio diversification metrics */
export type PortfolioDiversificationMetric = {
  differentDebtors: number
  differentInvoices: number
  averageInvoiceAmount: number
  maxDebtorExposure: number
  maxDebtorExposurePercentage: number
}

/** Display transformation for account balance chart data */
export type AccountBalanceDataItem = {
  name: string
  type: string
  value: number
  formattedValue: string
  fill: string
}

export type CompanyInvoicesByStatusMetric = {
  status: string
  invoiceCount: number
  totalAmount: number
}

export type CompanyPublishedInvoicesVolumeMetric = {
  publishedInvoicesVolume: number
  publishedInvoicesCount: number
}

export type CompanyFinancedOwnInvoicesVolumeMetric = {
  financedOwnInvoicesVolume: number
  financedOwnInvoicesCount: number
}

export type CompanyPendingValidationInvoiceMetric = {
  id: string
  amount: number
  dueDate: string
  status: string
  createdAt: string
  debtorCompanyName: string | null
}

export type CompanyActiveOwnAuctionMetric = {
  id: string
  status: string
  dateStart: string
  dateEnd: string
  amount: number
  dueDate: string
}

export type CompanyOwnAuctionsByStatusMetric = {
  status: string
  auctionCount: number
}

export type CompanyReceivedBidsMetric = {
  receivedBidsCount: number
  receivedBidAmount: number
}

export type CompanyAverageFinancingCostMetric = {
  averageDiscount: number
  averageInvestorProfitability: number
}

export type CompanyDebtorsByStatusMetric = {
  status: string
  debtorCount: number
}

export type CompanyDocumentsPerInvoiceMetric = {
  invoiceId: string
  amount: number
  documentsCount: number
}

export type CompanyInvestorActivityMetric = {
  companyInvestorVolume: number
  companyAcquiredInvoices: number
}

export type AdminUsersByStatusAndTypeMetric = {
  type: string
  investorType: string | null
  status: string
  usersCount: number
}

export type AdminPendingValidationUserMetric = number

export type AdminDebtorsByStatusMetric = {
  status: string
  debtorsCount: number
}

export type AdminPendingValidationDebtorMetric = number

export type AdminInvoicesByStatusMetric = {
  status: string
  invoiceCount: number
  totalAmount: number
}

export type AdminPendingValidationInvoiceMetric = number

export type AdminAuctionsByStatusMetric = {
  status: string
  auctionCount: number
}

export type AdminAuctionsInTransitionMetric = number

export type AdminPlatformTotalFinancedVolumeMetric = {
  platformTotalFinancedVolume: number
  platformFinancedInvoicesCount: number
}

export type AdminAuctionToFinanceConversionMetric = {
  auctionedInvoices: number
  financedInvoices: number
  auctionToFinanceConversion: number
}

export type AdminOverduePendingInvoicesMetric = {
  overdueInvoices: number
  overdueAmount: number
}

export type AdminMonthlyFinancedVolumeMetric = {
  month: string
  invoiceCount: number
  financedVolume: number
}

export type AdminPlatformRiskDistributionMetric = {
  rating: number
  invoiceCount: number
  totalAmount: number
}

export type AdminTopDebtorsByExposureMetric = {
  debtorId: string
  companyName: string
  invoiceCount: number
  totalAmount: number
}

export type AdminAggregatedBankAccountBalancesMetric = {
  platform: boolean
  totalBalance: number
  totalReservedBalance: number
}

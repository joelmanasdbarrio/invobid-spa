import useLoggedInUser from '@/hooks/use-loggedInUser'
import { AccountBalance } from '@/pages/dashboard/metrics/individual/account-balance.tsx'
import { AverageProfitability } from '@/pages/dashboard/metrics/individual/average-profitability.tsx'
import { DebtorStats } from '@/pages/dashboard/metrics/individual/debtor-stats.tsx'
import { InvestedVolume } from '@/pages/dashboard/metrics/individual/invested-volume.tsx'
import { type Investor, InvestorType, UserType } from '@/types/User'
import { AdminAggregatedBalances } from './metrics/admin/admin-aggregated-balances'
import { AdminEcosystemHealth } from './metrics/admin/admin-ecosystem-health'
import { AdminLifecycleTrends } from './metrics/admin/admin-lifecycle-trends'
import { AdminMonthlyFinancedVolume } from './metrics/admin/admin-monthly-financed-volume'
import { AdminPlatformOverview } from './metrics/admin/admin-platform-overview'
import { AdminRiskAndExposure } from './metrics/admin/admin-risk-and-exposure'
import { AdminValidationPipeline } from './metrics/admin/admin-validation-pipeline'
import { CompanyAuctionsOverview } from './metrics/company/company-auctions-overview'
import { CompanyDebtorsByStatus } from './metrics/company/company-debtors-by-status'
import { CompanyDocumentsPerInvoice } from './metrics/company/company-documents-per-invoice'
import { CompanyFinancingCost } from './metrics/company/company-financing-cost'
import { CompanyInvoicesOverview } from './metrics/company/company-invoices-overview'
import { CompanyOperationsSummary } from './metrics/company/company-operations-summary'
import { CompanyPendingValidationInvoices } from './metrics/company/company-pending-validation-invoices'
import { CompanyReceivedBids } from './metrics/company/company-received-bids'
import { AuctionParticipation } from './metrics/individual/auction-participation'
import { InvoiceStats } from './metrics/individual/invoice-stats'
import { PortfolioDiversification } from './metrics/individual/portfolio-diversification'
import { RiskDistribution } from './metrics/individual/risk-distribution'

export default function DashboardPage () {
  const { loggedInUser } = useLoggedInUser()

  const isInvestorUser = (user: typeof loggedInUser): user is Investor => {
    return user?.type === UserType.INVESTOR
  }

  return (
    <div className='flex flex-col gap-4'>
      <p>Welcome to your dashboard!</p>

      <div className='grid lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4 [&>div]:gap-2'>
        {isInvestorUser(loggedInUser) && loggedInUser.investorType === InvestorType.INDIVIDUAL && (
          <>
            <AccountBalance className='col-span-2 lg:row-span-2' />
            <AverageProfitability className='col-span-2 lg:col-span-4 row-span-4 lg:row-span-2' />
            <AuctionParticipation className='col-span-2 lg:row-span-2' />
            <InvestedVolume className='col-span-2 lg:row-span-2' />
            <InvoiceStats className='col-span-2 lg:row-span-4 xl:col-start-7 xl:row-start-1' />
            <DebtorStats className='col-span-2 lg:row-span-4' />
            <PortfolioDiversification className='col-span-2 row-span-2 lg:col-span-4' />
            <RiskDistribution className='col-span-2 row-span-2 lg:col-span-4' />
          </>
        )}

        {isInvestorUser(loggedInUser) && loggedInUser.investorType === InvestorType.COMPANY && (
          <>
            <CompanyInvoicesOverview className='col-span-2 lg:col-span-4 row-span-2' />
            <CompanyAuctionsOverview className='col-span-2 row-span-3' />
            <CompanyReceivedBids className='col-span-2 row-span-2 2xl:row-span-1' />
            <CompanyDebtorsByStatus className='col-span-2 lg:col-span-2 row-span-2' />
            <CompanyFinancingCost className='col-span-2 lg:col-span-4' />
            <CompanyOperationsSummary className='col-span-2 lg:col-span-4' />
            <CompanyDocumentsPerInvoice className='col-span-2 lg:col-span-4 row-span-3' />
            <CompanyPendingValidationInvoices className='col-span-2 lg:col-span-4 lg:row-span-4' />
          </>
        )}

        {loggedInUser && loggedInUser.type === UserType.ADMIN && (
          <>
            <AdminMonthlyFinancedVolume className='lg:col-span-full row-span-2' />
            <AdminPlatformOverview className='lg:col-span-3 2xl:col-span-4 row-span-2' />
            <AdminRiskAndExposure className='lg:col-span-3 2xl:col-span-4 row-span-2' />
            <AdminValidationPipeline className='lg:col-span-2 row-span-2' />
            <AdminAggregatedBalances className='lg:col-span-2 row-span-2' />
            <AdminLifecycleTrends className='lg:col-span-4 row-span-2' />
            <AdminEcosystemHealth className='lg:col-span-full 2xl:col-span-4 row-span-2' />
          </>
        )}
      </div>
    </div>
  )
}

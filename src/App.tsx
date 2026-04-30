import AdminUsersPage from '@/pages/admin/users/page.tsx'
import { useState } from 'react'
import { Route, Routes } from 'react-router'
import { ThemeProvider } from './components/dark-mode/theme-provider'
import { ProtectedRoute } from './components/protected-route'
import MainLayout from './layouts/layout'
import AdminAuctionPage from './pages/admin/auctions/aution/page'
import AdminAuctionsPage from './pages/admin/auctions/page'
import AdminDebtorPage from './pages/admin/debtors/debtor/page'
import AdminDebtorsPage from './pages/admin/debtors/page'
import AdminInvoicePage from './pages/admin/invoices/invoice/page'
import AdminInvoicesPage from './pages/admin/invoices/page'
import AdminUserPage from './pages/admin/users/user/page'
import DashboardPage from './pages/dashboard/page'
import Login from './pages/login/page'
import MarketplaceAuctionPage from './pages/marketplace/auctions/auction/page'
import MarketplaceAuctionsPage from './pages/marketplace/auctions/page'
import MarketplaceInvoicesPage from './pages/marketplace/invoices/page'
import NotFoundPage from './pages/not-found'
import ProfilePage from './pages/profile/page'
import Register from './pages/register/page'
import AuctionPage from './pages/user/auctions/auction/page'
import CreateAuctionPage from './pages/user/auctions/create-auction/page'
import AuctionsPage from './pages/user/auctions/page'
import CreateDebtorPage from './pages/user/debtors/create-debtor/page'
import DebtorPage from './pages/user/debtors/debtor/page'
import DebtorsPage from './pages/user/debtors/page'
import CreateInvoicePage from './pages/user/invoices/create-invoice/page'
import InvoicePage from './pages/user/invoices/invoice/page'
import InvoicesPage from './pages/user/invoices/page'
import { InvestorType, UserType } from './types/User'

function App () {

  const [lastBreadcrumb, setLastBreadcrumb] = useState<string>('')

  return (
    <ThemeProvider defaultTheme='light' storageKey='dark-theme'>
      <main className='antialiased w-dvw h-dvh flex flex-col p-0!'>
        <Routes>
          {/* Public Routes */}
          <Route path='/register' element={<Register /> }/>
          <Route path='/login' element={<Login />}/>

          {/* Protected Routes */}
          <Route path='/' element={<ProtectedRoute><MainLayout breadcrumbs={[ { label: 'Dashboard', href: '/' } ]} ><DashboardPage /></MainLayout></ProtectedRoute> } />
          <Route path='/profile' element={ <ProtectedRoute> <MainLayout breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Perfil', href: '/profile' }]}><ProfilePage /></MainLayout></ProtectedRoute>} />

          <Route path='/admin/users'>
            <Route index element={<ProtectedRoute userType={UserType.ADMIN}><MainLayout breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Gestión de usuarios', href: '/admin/users' }]}><AdminUsersPage /></MainLayout></ProtectedRoute>} />
            <Route path=':investorId' element={<ProtectedRoute userType={UserType.ADMIN}><MainLayout breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Gestión de usuarios', href: '/admin/users' }, { label: lastBreadcrumb, href: '/admin/users/:investorId' }]}><AdminUserPage setLastBreadcrumb={setLastBreadcrumb} /></MainLayout></ProtectedRoute>} />
          </Route>

          <Route path='/admin/debtors'>
            <Route index element={<ProtectedRoute userType={UserType.ADMIN}><MainLayout breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Gestión de deudores', href: '/admin/debtors' }]}><AdminDebtorsPage /></MainLayout></ProtectedRoute>} />
            <Route path=':debtorId' element={<ProtectedRoute userType={UserType.ADMIN}><MainLayout breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Gestión de deudores', href: '/admin/debtors' }, { label: lastBreadcrumb, href: '/admin/debtors/:debtorId' }]}><AdminDebtorPage setLastBreadcrumb={setLastBreadcrumb} /></MainLayout></ProtectedRoute>} />
          </Route>

          <Route path='/admin/invoices'>
            <Route index element={<ProtectedRoute userType={UserType.ADMIN}><MainLayout breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Gestión de facturas', href: '/admin/invoices' }]}><AdminInvoicesPage /></MainLayout></ProtectedRoute>} />
            <Route path=':svc' element={<ProtectedRoute userType={UserType.ADMIN}><MainLayout breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Gestión de facturas', href: '/admin/invoices' }, { label: lastBreadcrumb, href: '/admin/invoices/:svc' }]}><AdminInvoicePage setLastBreadcrumb={setLastBreadcrumb} /></MainLayout></ProtectedRoute>} />
          </Route>

          <Route path='/admin/auctions'>
            <Route index element={<ProtectedRoute userType={UserType.ADMIN}><MainLayout breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Gestión de subastas', href: '/auctions' }]}><AdminAuctionsPage /></MainLayout></ProtectedRoute>} />
            <Route path=':auctionId' element={<ProtectedRoute userType={UserType.ADMIN}><MainLayout breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Gestión de subastas', href: '/auctions' }, { label: lastBreadcrumb, href: '/admin/auctions/:auctionId' }]}><AdminAuctionPage setLastBreadcrumb={setLastBreadcrumb} /></MainLayout></ProtectedRoute>} />
          </Route>

          <Route path='/debtors'>
            <Route index element={<ProtectedRoute userType={InvestorType.COMPANY}><MainLayout breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Mis deudores', href: '/debtors' }]} ><DebtorsPage /></MainLayout></ProtectedRoute>} />
            <Route path=':debtorId' element={<ProtectedRoute userType={InvestorType.COMPANY}><MainLayout breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Mis deudores', href: '/debtors' }, { label: lastBreadcrumb, href: '/debtors/:debtorId' }]}><DebtorPage setLastBreadcrumb={setLastBreadcrumb} /></MainLayout></ProtectedRoute>} />
            <Route path='create' element={<ProtectedRoute userType={InvestorType.COMPANY}><MainLayout breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Mis deudores', href: '/debtors' }, { label: 'Crear deudor', href: '/debtors/create' }]}><CreateDebtorPage /></MainLayout></ProtectedRoute>} />
          </Route>

          <Route path='/invoices'>
            <Route index element={<ProtectedRoute userType={UserType.INVESTOR}><MainLayout breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Mis facturas', href: '/invoices' }]}><InvoicesPage /></MainLayout></ProtectedRoute>} />
            <Route path=':invoiceId' element={<ProtectedRoute userType={UserType.INVESTOR}><MainLayout breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Mis facturas', href: '/invoices' }, { label: lastBreadcrumb, href: '/invoices/:svc' }]}><InvoicePage setLastBreadcrumb={setLastBreadcrumb} /></MainLayout></ProtectedRoute>} />
            <Route path='create' element={<ProtectedRoute userType={UserType.INVESTOR}><MainLayout breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Mis facturas', href: '/invoices' }, { label: 'Crear factura', href: '/invoices/create' }]}><CreateInvoicePage /></MainLayout></ProtectedRoute>} />
          </Route>

          <Route path='/auctions'>
            <Route index element={<ProtectedRoute userType={InvestorType.COMPANY}><MainLayout breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Mis subastas', href: '/auctions' }]}><AuctionsPage /></MainLayout></ProtectedRoute>} />
            <Route path=':auctionId' element={<ProtectedRoute userType={InvestorType.COMPANY}><MainLayout breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Mis subastas', href: '/auctions' }, { label: lastBreadcrumb, href: '/auctions/:auctionId' }]}><AuctionPage setLastBreadcrumb={setLastBreadcrumb} /></MainLayout></ProtectedRoute>} />
            <Route path='create' element={<ProtectedRoute userType={InvestorType.COMPANY}><MainLayout breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Mis subastas', href: '/auctions' }, { label: 'Crear subasta', href: '/auctions/create' }]}><CreateAuctionPage /></MainLayout></ProtectedRoute>} />
          </Route>

          {/* Marketplace */}
          <Route path='/marketplace/auctions'>
            <Route index element={<ProtectedRoute userType={UserType.INVESTOR}><MainLayout breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Subastas activas', href: '/marketplace/auctions' }]}><MarketplaceAuctionsPage /></MainLayout></ProtectedRoute>} />
            <Route path=':auctionId' element={<ProtectedRoute userType={UserType.INVESTOR}><MainLayout breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Subastas activas', href: '/marketplace/auctions' }, { label: lastBreadcrumb, href: '/marketplace/auctions/:auctionId' }]}><MarketplaceAuctionPage setLastBreadcrumb={setLastBreadcrumb} /></MainLayout></ProtectedRoute>} />
          </Route>

          <Route path='/marketplace/invoices'>
            <Route index element={<ProtectedRoute userType={UserType.INVESTOR}><MainLayout breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Facturas compradas', href: '/marketplace/invoices' }]}><MarketplaceInvoicesPage /></MainLayout></ProtectedRoute>} />
          </Route>

          <Route path='*' element={<ProtectedRoute><MainLayout><NotFoundPage /></MainLayout></ProtectedRoute>} />
        </Routes>
      </main>
    </ThemeProvider>
  )
}

export default App

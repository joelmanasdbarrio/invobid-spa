import AdminUsersPage from '@/pages/admin/users/page.tsx'
import { Route, Routes } from 'react-router'
import { ThemeProvider } from './components/dark-mode/theme-provider'
import { ProtectedRoute } from './components/protected-route'
import MainLayout from './layouts/layout'
import AdminDebtorPage from './pages/admin/debtors/debtor/page'
import AdminDebtorsPage from './pages/admin/debtors/page'
import AdminUserPage from './pages/admin/users/user/page'
import DashboardPage from './pages/dashboard/page'
import Login from './pages/login/page'
import NotFoundPage from './pages/not-found'
import ProfilePage from './pages/profile/page'
import Register from './pages/register/page'
import CreateDebtor from './pages/user/debtors/create-debtor/page'
import DebtorPage from './pages/user/debtors/debtor/page'
import DebtorsPage from './pages/user/debtors/page'
import { InvestorType, UserType } from './types/User'

function App () {

  return (
    <ThemeProvider defaultTheme='light' storageKey='dark-theme'>
      <main className='antialiased w-dvw h-dvh flex flex-col p-0!'>
        <Routes>
          {/* Public Routes */}
          <Route path='/register' element={<Register /> }/>
          <Route path='/login' element={<Login />}/>

          {/* Protected Routes */}
          <Route path='/' element={<ProtectedRoute><MainLayout header='Dashboard'><DashboardPage /></MainLayout></ProtectedRoute>} />
          <Route path='/profile' element={<ProtectedRoute><MainLayout header='Perfil'><ProfilePage /></MainLayout></ProtectedRoute>} />

          <Route path='/admin/users'>
            <Route index element={<ProtectedRoute userType={UserType.ADMIN}><MainLayout header='Gestión de usuarios'><AdminUsersPage /></MainLayout></ProtectedRoute>} />
            <Route path=':investorId' element={<ProtectedRoute userType={UserType.ADMIN}><MainLayout header='Gestionar usuario'><AdminUserPage /></MainLayout></ProtectedRoute>} />
          </Route>

          <Route path='/admin/debtors'>
            <Route index element={<ProtectedRoute userType={UserType.ADMIN}><MainLayout header='Gestión de deudores'><AdminDebtorsPage /></MainLayout></ProtectedRoute>} />
            <Route path=':debtorId' element={<ProtectedRoute userType={UserType.ADMIN}><MainLayout header='Gestionar deudor'><AdminDebtorPage /></MainLayout></ProtectedRoute>} />
          </Route>

          <Route path='/debtors'>
            <Route index element={<ProtectedRoute userType={InvestorType.COMPANY}><MainLayout header='Mis deudores'><DebtorsPage /></MainLayout></ProtectedRoute>} />
            <Route path=':debtorId' element={<ProtectedRoute userType={InvestorType.COMPANY}><MainLayout header='Gestionar deudor'><DebtorPage /></MainLayout></ProtectedRoute>} />
            <Route path='create' element={<ProtectedRoute userType={InvestorType.COMPANY}><MainLayout header='Crear deudor'><CreateDebtor /></MainLayout></ProtectedRoute>} />
          </Route>

          <Route path='*' element={<ProtectedRoute><MainLayout><NotFoundPage /></MainLayout></ProtectedRoute>} />
        </Routes>
      </main>
    </ThemeProvider>
  )
}

export default App

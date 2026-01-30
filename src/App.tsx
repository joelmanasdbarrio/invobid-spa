import AdminUsersPage from '@/pages/dashboard/admin/users/page.tsx'
import { Route, Routes } from 'react-router'
import { ThemeProvider } from './components/dark-mode/theme-provider'
import { ProtectedRoute } from './components/protected-route'
import MainLayout from './layouts/layout'
import AdminDebtorPage from './pages/dashboard/admin/debtors/debtor/page'
import AdminDebtorsPage from './pages/dashboard/admin/debtors/page'
import AdminUserPage from './pages/dashboard/admin/users/user/page'
import DashboardPage from './pages/dashboard/page'
import Login from './pages/login/page'
import NotFoundPage from './pages/not-found'
import ProfilePage from './pages/profile/page'
import Register from './pages/register/page'

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
            <Route index element={<ProtectedRoute><MainLayout header='Gestión de usuarios'><AdminUsersPage /></MainLayout></ProtectedRoute>} />
            <Route path=':investorId' element={<ProtectedRoute><MainLayout header='Gestionar usuario'><AdminUserPage /></MainLayout></ProtectedRoute>} />
          </Route>

          <Route path='/admin/debtors'>
            <Route index element={<ProtectedRoute><MainLayout header='Gestión de deudores'><AdminDebtorsPage /></MainLayout></ProtectedRoute>} />
            <Route path=':debtorId' element={<ProtectedRoute><MainLayout header='Gestionar deudor'><AdminDebtorPage /></MainLayout></ProtectedRoute>} />
          </Route>

          <Route path='*' element={<ProtectedRoute><MainLayout><NotFoundPage /></MainLayout></ProtectedRoute>} />
        </Routes>
      </main>
    </ThemeProvider>
  )
}

export default App

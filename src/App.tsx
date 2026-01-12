import AdminUsersPage from '@/pages/dashboard/admin/users/page.tsx'
import {Route, Routes} from 'react-router'
import {ThemeProvider} from './components/dark-mode/theme-provider'
import {ProtectedRoute} from './components/protected-route'
import MainLayout from './layouts/layout'
import AdminUserPage from './pages/dashboard/admin/users/user/page'
import DashboardPage from './pages/dashboard/page'
import Login from './pages/login/page'
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
        </Routes>
      </main>
    </ThemeProvider>
  )
}

export default App

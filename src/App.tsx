import AdminUsersPage from '@/pages/dashboard/admin/users/page.tsx'
import {Route, Routes} from 'react-router'
import {ThemeProvider} from './components/dark-mode/theme-provider'
import MainLayout from './layouts/layout'
import AdminUserPage from './pages/dashboard/admin/users/user/page'
import DashboardPage from './pages/dashboard/page'
import Login from './pages/login/page'
import Register from './pages/register/page'

function App () {

  return (
    <ThemeProvider defaultTheme='light' storageKey='dark-theme'>
      <main className='antialiased w-dvw h-dvh flex flex-col p-0!'>
        <Routes>
          <Route path='/login' element={<Login />}/>
          <Route path='/register' element={<Register /> }/>

          <Route path='/' element={<MainLayout header='Dashboard'><DashboardPage /></MainLayout>} />

          <Route path='/admin/users'>
            <Route index element={<MainLayout header='Gestión de usuarios'><AdminUsersPage /></MainLayout>} />
            <Route path=':investorId' element={<MainLayout header='Gestionar usuario'><AdminUserPage /></MainLayout>} />
          </Route>
        </Routes>
      </main>
    </ThemeProvider>
  )
}

export default App

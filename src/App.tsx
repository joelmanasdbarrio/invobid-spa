import { Route, Routes } from 'react-router'
import { ThemeProvider } from './components/dark-mode/theme-provider'
import MainLayout from './layouts/layout'
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
        </Routes>
      </main>
    </ThemeProvider>
  )
}

export default App

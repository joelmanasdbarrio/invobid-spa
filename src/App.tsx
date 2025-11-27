import { Route, Routes } from 'react-router'
import MainLayout from './layouts/layout'
import Home from './pages/Home'
import Login from './pages/login'
import Register from './pages/register'

function App () {

  return (
    <main className='antialiased container! mx-auto! w-dvw h-dvh flex flex-col p-0!'>
      <Routes>
        <Route path='/login' element={<Login />}/>
        <Route path='/register' element={<Register /> }/>

        <Route path='/home' element={<MainLayout><Home /></MainLayout>} />
      </Routes>
    </main>
  )
}

export default App

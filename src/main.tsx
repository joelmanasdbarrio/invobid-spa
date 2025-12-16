import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {BrowserRouter} from 'react-router'
import App from './App.tsx'
import {Toaster} from './components/ui/sonner.tsx'
import './index.css'
import {AuthProvider} from '@/contexts/auth.context.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          duration={3000}
          position='bottom-center'
        />
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)

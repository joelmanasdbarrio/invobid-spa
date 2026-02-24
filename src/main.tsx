import { AuthProvider } from '@/contexts/auth.context.tsx'
import { LocaleProvider } from '@/contexts/locale.context.tsx'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App.tsx'
import { Toaster } from './components/ui/sonner.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <LocaleProvider>
      <AuthProvider>
        <Toaster
          duration={3000}
          position='bottom-center'
        />
        <App />
      </AuthProvider>
    </LocaleProvider>
  </BrowserRouter>
)

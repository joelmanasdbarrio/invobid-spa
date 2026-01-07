import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import InvestorForm from '@/pages/register/investor-form.tsx'
import { TabsContent } from '@radix-ui/react-tabs'
import AdminForm from './admin-form'

export default function Register () {
  const appName = import.meta.env.VITE_APP_NAME

  return (
    <div className='grow flex flex-col sm:items-center sm:justify-center p-4'>
      <div className='flex flex-col gap-4 w-full max-w-2xl'>
        <div className='flex flex-col items-center gap-1 text-center'>
          <h1 className='text-2xl font-bold'>Regístrate en {appName}</h1>
        </div>
        <Tabs defaultValue='company'>
          <div className='flex flex-col gap-2'>
            ¿Quién eres?
            <TabsList>
              <TabsTrigger value='company'>Empresa</TabsTrigger>
              <TabsTrigger value='individual'>Particular</TabsTrigger>
              <TabsTrigger value='admin'>Administrador</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value='company'>
            <InvestorForm investorType='company' />
          </TabsContent>
          <TabsContent value='individual'>
            <InvestorForm investorType='individual' />
          </TabsContent>
          <TabsContent value='admin'>
            <AdminForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

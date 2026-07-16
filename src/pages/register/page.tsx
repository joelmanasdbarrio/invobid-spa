import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import InvestorForm from '@/pages/register/investor-form.tsx'
import { InvestorType, UserType } from '@/types/User'
import { TabsContent } from '@radix-ui/react-tabs'
import AdminForm from './admin-form'

export default function Register () {
  const appName = import.meta.env.VITE_APP_NAME

  return (
    <div className='grow flex flex-col sm:items-center sm:justify-center p-4 overflow-auto'>
      <div className='flex flex-col gap-4 w-full max-w-2xl'>
        <div className='flex flex-col items-center gap-1 text-center'>
          <h1 className='text-2xl font-bold'>Regístrate en {appName}</h1>
        </div>
        <Tabs defaultValue={InvestorType.COMPANY}>
          <div className='flex flex-col gap-2'>
            ¿Quién eres?
            <TabsList>
              <TabsTrigger value={InvestorType.COMPANY}>Empresa</TabsTrigger>
              <TabsTrigger value={InvestorType.INDIVIDUAL}>Particular</TabsTrigger>
              <TabsTrigger value={UserType.ADMIN}>Administrador</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value={InvestorType.COMPANY}>
            <InvestorForm investorType={InvestorType.COMPANY} />
          </TabsContent>
          <TabsContent value={InvestorType.INDIVIDUAL}>
            <InvestorForm investorType={InvestorType.INDIVIDUAL} />
          </TabsContent>
          <TabsContent value={UserType.ADMIN}>
            <AdminForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

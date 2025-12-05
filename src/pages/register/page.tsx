import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TabsContent } from '@radix-ui/react-tabs'
import AdminForm from './admin-form'
import CompanyForm from './company-form'
import IndividualForm from './individual-form'

export default function Register () {
  const appName = import.meta.env.VITE_APP_NAME


  return (
    <div className='grow flex flex-col sm:items-center sm:justify-center p-4'>
      <div className='flex flex-col gap-4 w-full max-w-2xl'>
        <div className='flex flex-col items-center gap-1 text-center'>
          <h1 className='text-2xl font-bold'>Regístrate en {appName?.toUpperCase()}</h1>
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
            <CompanyForm />
          </TabsContent>
          <TabsContent value='individual'>
            <IndividualForm />
          </TabsContent>
          <TabsContent value='admin'>
            <AdminForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

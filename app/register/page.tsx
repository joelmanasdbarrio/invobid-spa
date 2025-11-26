import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TabsContent } from '@radix-ui/react-tabs'
import AdminForm from './admin-form'
import InvestorForm from './investor-form'
import SupplierForm from './supplier-form'

export default function Register () {
  return (
    <div className='grow flex flex-col sm:items-center sm:justify-center p-4'>
      <div className='flex flex-col gap-4 w-full max-w-2xl'>
        <div className='flex flex-col items-center gap-1 text-center'>
          <h1 className='text-2xl font-bold'>Regístrate en {process.env.APP_NAME?.toUpperCase()}</h1>
        </div>
        <Tabs defaultValue='supplier'>
          <div className='flex flex-col gap-2'>
            ¿Quién eres?
            <TabsList>
              <TabsTrigger value='supplier'>Emisor</TabsTrigger>
              <TabsTrigger value='investor'>Inversor</TabsTrigger>
              <TabsTrigger value='admin'>Administrador</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value='supplier'>
            <SupplierForm />
          </TabsContent>
          <TabsContent value='investor'>
            <InvestorForm />
          </TabsContent>
          <TabsContent value='admin'>
            <AdminForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
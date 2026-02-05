import { Button } from '@/components/ui/button.tsx'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog.tsx'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select.tsx'
import { investorColumns } from '@/pages/admin/users/columns.tsx'
import { DataTable } from '@/pages/admin/users/data-table.tsx'
import UserFilters from '@/pages/admin/users/filters.tsx'
import { getInvestors } from '@/services/investor.api.ts'
import { InvestorStatus, InvestorType } from '@/types/User'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSearchParams } from 'react-router'
import { z } from 'zod'

const formSchema = z.object({
  email: z.string().optional(),
  name: z.string().optional(),
  companyName: z.string().optional(),
  phoneNumber: z.string().optional(),
  taxId: z.string().optional(),
  investorType: z.enum(InvestorType).optional(),
  status: z.enum(InvestorStatus).optional(),
  includeDeleted: z.boolean().default(false).optional()
})

export default function AdminUsersPage () {
  const [searchParams, setSearchParams] = useSearchParams()

  const defaultForm = useMemo(() => ({
    email: searchParams.get('email') || '',
    name: searchParams.get('name') || '',
    companyName: searchParams.get('companyName') || '',
    phoneNumber: searchParams.get('phoneNumber') || '',
    taxId: searchParams.get('taxId') || '',
    investorType: searchParams.has('investorType') ? (searchParams.get('investorType') as InvestorType) : undefined,
    status: searchParams.has('status') ? (searchParams.get('status') as InvestorStatus) : undefined,
    includeDeleted: searchParams.get('includeDeleted') === 'true'
  }), [searchParams])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: defaultForm
  })

  useEffect(() => {
    form.reset(defaultForm)
  }, [form, defaultForm])

  const [data, setData] = useState([])
  const [totalItems, setTotalItems] = useState(0)

  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10))
  const [currentLimit, setCurrentLimit] = useState(parseInt(searchParams.get('limit') || '10', 10))

  function onSubmit (data: z.infer<typeof formSchema>) {
    const formData = Object.fromEntries(
      Object.entries(data).filter(
        ([, value]) => value !== '' && value !== undefined
      )
    )
    const newParams = new URLSearchParams(formData as Record<string, string>)
    newParams.set('page', '1')
    newParams.set('limit', currentLimit.toString())
    setSearchParams(newParams)
  }

  useEffect(() => {
    const filters: Record<string, string|number> = {}
    searchParams.forEach((value, key) => {
      if (key !== 'page' && key !== 'limit') {
        filters[key] = value
      }
    })

    if (searchParams.get('includeDeleted') !== true.toString()) {
      delete filters.includeDeleted
    }

    getInvestors({
      ...filters,
      page: String(currentPage),
      limit: String(currentLimit)
    }).then(res => {
      setData(res.data)
      setTotalItems(res['_metadata'].total)
    })
  }, [currentLimit, currentPage, searchParams])

  function handleClear () {
    form.reset({
      email: '',
      name: '',
      companyName: '',
      phoneNumber: '',
      taxId: '',
      investorType: undefined,
      status: undefined,
      includeDeleted: false
    })
    setSearchParams(new URLSearchParams({ page: '1', limit: '10' }))
  }

  function handlePageChange (newPage: number) {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('page', newPage.toString())
    setCurrentPage(newPage)
    setSearchParams(newParams)
  }

  function handleLimitChange (newLimit: number) {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('limit', newLimit.toString())
    newParams.set('page', '1')
    setCurrentLimit(newLimit)
    setCurrentPage(1)
    setSearchParams(newParams)
  }

  return (
    <div className='flex flex-col gap-4'>
      <Dialog>
        <div className='hidden md:block'>
          <UserFilters form={form} onSubmit={onSubmit} handleClear={handleClear} />
        </div>

        <DialogContent className='max-h-svh overflow-scroll'>
          <DialogHeader className='font-bold text-lg'>
            Filtrar usuarios
          </DialogHeader>
          <UserFilters form={form} onSubmit={onSubmit} handleClear={handleClear} />
        </DialogContent>

        <DataTable columns={investorColumns} data={data} />
      </Dialog>

      <div className='flex items-center justify-center gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Anterior
        </Button>
        Página {currentPage} de {Math.ceil(totalItems / currentLimit)}
        <Button
          variant='outline'
          size='sm'
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage * currentLimit >= totalItems}
        >
          Siguiente
        </Button>
        <Select value={String(currentLimit)} onValueChange={value => handleLimitChange(Number(value))}>
          <SelectTrigger className='py-0! h-8!'>
            {currentLimit}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='5'>5</SelectItem>
            <SelectItem value='10'>10</SelectItem>
            <SelectItem value='20'>20</SelectItem>
            <SelectItem value='50'>50</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

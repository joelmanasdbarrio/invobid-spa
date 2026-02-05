import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import useLoggedInUser from '@/hooks/use-loggedInUser'
import { getDebtors } from '@/services/debtor.api'
import { DebtorStatus } from '@/types/Debtor'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSearchParams } from 'react-router'
import z from 'zod'
import { debtorColumns } from './columns'
import { DataTable } from './data-table'
import DebtorFilters from './filters'

const formSchema = z.object({
  email: z.string().optional(),
  phoneNumber: z.string().optional(),
  companyName: z.string().optional(),
  taxId: z.string().optional(),
  investorId: z.string().optional(),
  status: z.enum(DebtorStatus).optional(),
  includeDeleted: z.boolean().default(false).optional()
})

export default function DebtorsPage () {
  const [searchParams, setSearchParams] = useSearchParams()

  const defaultForm = useMemo(() => ({
    email: searchParams.get('email') || '',
    phoneNumber: searchParams.get('phoneNumber') || '',
    companyName: searchParams.get('companyName') || '',
    taxId: searchParams.get('taxId') || '',
    investorId: searchParams.get('investorId') || '',
    status: searchParams.has('status') ? (searchParams.get('status') as DebtorStatus) : undefined,
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

  const loggedInUser = useLoggedInUser()

  useEffect(() => {
    const filters: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      if (key !== 'page' && key !== 'limit') {
        filters[key] = value
      }
    })

    if (searchParams.get('includeDeleted') !== true.toString()) {
      delete filters.includeDeleted
    }

    getDebtors({
      ...filters,
      investorId: loggedInUser.id,
      page: String(currentPage),
      limit: String(currentLimit)
    }).then(res => {
      setData(res.data)
      setTotalItems(res['_metadata'].total)
    })
  }, [loggedInUser, searchParams, currentPage, currentLimit])

  function handleClear () {
    form.reset({
      email: '',
      phoneNumber: '',
      companyName: '',
      taxId: '',
      investorId: '',
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
          <DebtorFilters form={form} onSubmit={onSubmit} handleClear={handleClear} />
        </div>

        <DialogContent className='max-h-svh overflow-scroll'>
          <DialogHeader className='font-bold text-lg'>
            Filtrar usuarios
          </DialogHeader>
          <DebtorFilters form={form} onSubmit={onSubmit} handleClear={handleClear} />
        </DialogContent>

        <DataTable columns={debtorColumns} data={data} />
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

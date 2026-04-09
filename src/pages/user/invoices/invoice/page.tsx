import { ColorBadge } from '@/components/color-badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Form } from '@/components/ui/form'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select.tsx'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import useLoggedInUser from '@/hooks/use-loggedInUser.ts'
import { parseLocalDate, toDateOnlyString } from '@/lib/format-date'
import { getDebtors } from '@/services/debtor.api.ts'
import { getInvoiceById, updateInvoiceById } from '@/services/invoice.api'
import { type Debtor, DebtorStatus } from '@/types/Debtor.ts'
import { type Invoice, InvoiceStatus } from '@/types/Invoice'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  CheckCheckIcon,
  CircleAlertIcon,
  CircleQuestionMarkIcon,
  ClockIcon,
  FileIcon,
  FileTextIcon,
  KeyRoundIcon,
  OctagonXIcon,
  RefreshCcwIcon,
  SaveIcon,
  SearchIcon
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router'
import z from 'zod'
import InvoiceAuctions from './components/invoice-auctions/invoice-auctions'
import InvoiceDocuments from './components/invoice-documents/invoice-documents'

const validateFormSchema = z.object({
  status: z.enum(InvoiceStatus)
})

const baseFormSchema = z.object({
  debtorId: z.uuid('El deudor no es válido'),
  amount: z.coerce.number<number>(),
  dueDate: z.date('La fecha de vencimiento no es válida').refine((date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selectedDate = new Date(date)
    selectedDate.setHours(0, 0, 0, 0)
    return selectedDate > today
  }, {
    message: 'La fecha de vencimiento debe ser posterior a la fecha actual'
  })
})

const documentFormSchema = z.object({
  svc: z.string()
    .min(1, 'El identificador de factura es obligatorio')
    .or(z.literal('')),
  file: z.custom<FileList>()
    .refine((files) => files && files.length > 0, 'El documento es obligatorio')
    .refine((files) => files?.[0]?.size > 0, 'El documento no puede estar vacío')
}).refine((data) => {
  if (data.file || data.svc) {
    return data.file && data.svc
  }
  return true
})

export default function InvoicePage ({ setLastBreadcrumb }: { setLastBreadcrumb: (breadcrumb: string) => void }) {
  const {invoiceId} = useParams<{ invoiceId: string }>()
  const [invoice, setInvoice] = useState<Invoice | undefined>()
  const [originalInvoice, setOriginalInvoice] = useState<Invoice | undefined>(invoice)
  const [verifiedDebtors, setVerifiedDebtors] = useState<[Debtor]>()
  const [debtorSearch, setDebtorSearch] = useState('')
  const [isLoadingDebtors, setIsLoadingDebtors] = useState(false)

  const isFormDisabled = !invoice || invoice.status !== InvoiceStatus.CORRECTION

  const validateForm = useForm<z.infer<typeof validateFormSchema>>({
    resolver: zodResolver(validateFormSchema),
    mode: 'onTouched',
    defaultValues: {
      status: invoice?.status
    }
  })

  const baseForm = useForm<z.infer<typeof baseFormSchema>>({
    resolver: zodResolver(baseFormSchema),
    mode: 'onTouched',
    defaultValues: {
      debtorId: invoice?.debtor.id || '',
      amount: invoice?.amount || 0,
      dueDate: invoice ? parseLocalDate(invoice.dueDate) : undefined
    }
  })

  const documentForm = useForm<z.infer<typeof documentFormSchema>>({
    resolver: zodResolver(documentFormSchema),
    mode: 'onTouched',
    defaultValues: {
      svc: '',
      file: undefined
    }
  })

  useEffect(() => {
    baseForm.reset({
      debtorId: invoice?.debtor.id || '',
      amount: invoice?.amount || 0,
      dueDate: invoice ? parseLocalDate(invoice.dueDate) : undefined
    })
  }, [invoice, baseForm])

  const loggedInUser = useLoggedInUser()
  const navigate = useNavigate()

  useEffect(() => {
    if (!invoiceId || !loggedInUser) return
    getInvoiceById(invoiceId)
      .then(res => res.data)
      .then(invoice => {
        setInvoice(invoice)
        setOriginalInvoice(invoice)
        setLastBreadcrumb(`Factura ${invoice.svc}`)
      })
      .catch(() => {
        navigate('/user/invoices')
      })
  }, [invoiceId, loggedInUser, navigate, setLastBreadcrumb])

  useEffect(() => {
    if (!loggedInUser) return

    const timer = setTimeout(() => {
      setIsLoadingDebtors(true)
      getDebtors({
        investorId: loggedInUser.id,
        companyName: debtorSearch ?? undefined,
        status: DebtorStatus.VERIFIED
      })
        .then(res => res.data)
        .then(debtors => setVerifiedDebtors(debtors))
        .finally(() => setIsLoadingDebtors(false))
    }, 300)

    return () => clearTimeout(timer)
  }, [loggedInUser, debtorSearch])

  function onSubmitBase (data: z.infer<typeof baseFormSchema>) {
    if (!invoiceId) return
    updateInvoiceById(invoiceId, JSON.stringify({
      debtorId: data.debtorId,
      amount: data.amount,
      dueDate: toDateOnlyString(data.dueDate)
    }))
      .then(res => setInvoice(res.data))
      .then(() => navigate(`/user/invoices/${invoiceId}`))
  }

  function onSubmitDocument (data: z.infer<typeof documentFormSchema>) {
    if (!invoiceId) return
    const formData = new FormData()
    formData.append('svc', data.svc)
    formData.append('file', data.file[0])
    updateInvoiceById(invoiceId, formData)
      .then(res => setInvoice(res.data))
      .then(() => navigate(`/user/invoices/${invoiceId}`))
  }

  function onSubmitValidate (data: z.infer<typeof validateFormSchema>) {
    if (!invoiceId) return
    updateInvoiceById(invoiceId, JSON.stringify({
      status: data.status
    }))
      .then(res => setInvoice(res.data))
      .then(() => navigate(`/user/invoices/${invoiceId}`))
  }

  const invoiceStatusTextMap: {
    pending: { title: string; icon: React.JSX.Element };
    correction: { title: string; icon: React.JSX.Element };
    denied: { title: string; icon: React.JSX.Element }
  } = {
    pending: {
      title: 'Pendiente de verificación',
      icon: <ClockIcon className='w-full h-full rounded-full text-yellow-600 bg-yellow-300/25 p-2'/>
    },
    correction: {
      title: 'Corrección requerida',
      icon: <CircleAlertIcon className='w-full h-full rounded-full text-red-600 bg-red-300/25 p-2'/>
    },
    denied: {
      title: 'Factura denegada',
      icon: <OctagonXIcon className='w-full h-full rounded-full text-zinc-600 bg-zinc-300/25 p-2'/>
    }
  }

  return (
    <section className='flex flex-col gap-4'>
      <div className='flex items-center gap-2'>
        <span className='rounded-lg p-1 bg-primary/20 text-primary'>
          <FileTextIcon className='w-6 h-6' />
        </span>
        <h2>Gestionar factura</h2>
      </div>
      <Card>
        <CardHeader className='md:grid-cols-[auto_1fr]'>
          <div className='flex flex-wrap gap-2 items-center'>
            <h3>Detalles de la factura <span className='text-primary'>{invoice?.svc}</span></h3>
            {invoice?.status === InvoiceStatus.PENDING && (
              <ColorBadge color='yellow' icon={<ClockIcon />}>
                Pendiente
              </ColorBadge>
            )}
            {invoice?.status === InvoiceStatus.VERIFIED && (
              <ColorBadge color='green' icon={<CheckCheckIcon />}>
                Verificada
              </ColorBadge>
            )}
            {invoice?.status === InvoiceStatus.CORRECTION && (
              <ColorBadge color='red' icon={<CircleAlertIcon />}>
                Corrección
              </ColorBadge>
            )}
            {invoice?.status === InvoiceStatus.DENIED && (
              <ColorBadge color='gray' icon={<OctagonXIcon />}>
                Denegada
              </ColorBadge>
            )}
          </div>
          {(invoice?.status === InvoiceStatus.CORRECTION || invoice?.status === InvoiceStatus.PENDING) && (
            <Form {...validateForm}>
              <form onSubmit={validateForm.handleSubmit(onSubmitValidate)} className='ms-auto flex md:justify-end'>
                <Button
                  variant='outline'
                  className='group md:w-10 md:hover:w-full md:max-w-min md:gap-0 md:hover:gap-2 duration-200'
                  disabled={isFormDisabled}
                  onClick={() => {
                    validateForm.setValue('status', InvoiceStatus.PENDING)
                    validateForm.handleSubmit(onSubmitValidate)()
                  }}
                >
                  <RefreshCcwIcon className='transition-all group-hover:rotate-180 duration-200' />
                  <span className='overflow-hidden'>
                    Solicitar verificación
                  </span>
                </Button>
              </form>
            </Form>
          )}
        </CardHeader>
        <CardContent className='grid md:grid-cols-[1fr_200px] gap-4'>
          <Form {...baseForm}>
            <form onSubmit={baseForm.handleSubmit(onSubmitBase)} className='col-span-full flex flex-col gap-4'>
              <FieldSet>
                <FieldLegend>Información básica</FieldLegend>
                <FieldGroup className='grid grid-cols-1 lg:grid-cols-[1fr_1fr_minmax(10px,40px)]'>
                  <Controller
                    name='debtorId'
                    control={baseForm.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Deudor:</FieldLabel>
                        <Select
                          value={verifiedDebtors?.find(debtor => debtor.id === field.value)?.id || invoice?.debtor?.id || '__NONE__'}
                          onValueChange={(value) => field.onChange(value === '__NONE__' ? '' : value)}
                          defaultValue={field.value || ''}
                          disabled={isFormDisabled}
                        >
                          <SelectTrigger>
                            {verifiedDebtors?.find(debtor => debtor.id === field.value)?.companyName || invoice?.debtor?.companyName || 'Selecciona un deudor'}
                          </SelectTrigger>
                          <SelectContent>
                            <InputGroup className='border-0 border-b w-full'>
                              <InputGroupInput
                                value={debtorSearch}
                                onChange={e => setDebtorSearch(e.target.value)}
                                onKeyDown={e => e.stopPropagation()}
                                onKeyUp={e => e.stopPropagation()}
                                type='text'
                                placeholder='Razón social del deudor...'
                                autoComplete='off'
                              />
                              <InputGroupAddon>
                                {isLoadingDebtors ? <Spinner /> : <SearchIcon />}
                              </InputGroupAddon>
                            </InputGroup>
                            <SelectItem value='__NONE__'>
                              <span className='text-muted-foreground'>
                                Selecciona un deudor
                              </span>
                            </SelectItem>
                            {verifiedDebtors?.map(debtor => (
                              <SelectItem key={debtor.id} value={debtor.id}>
                                {debtor.companyName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </FieldGroup>
                <FieldGroup className='grid grid-cols-1 lg:grid-cols-[1fr_1fr_minmax(10px,40px)]'>
                  <Controller
                    name='amount'
                    control={baseForm.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Importe:</FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            name={field.name}
                            id={field.name}
                            type='number'
                            step='0.01'
                            placeholder='1000'
                            value={field.value ?? ''}
                            onChange={e => field.onChange(e.target.valueAsNumber)}
                            onBlur={() => {
                              if (field.value !== undefined && !isNaN(field.value)) {
                                field.onChange(Math.round(field.value * 100) / 100)
                              }
                              field.onBlur()
                            }}
                            ref={field.ref}
                            disabled={isFormDisabled}
                          />
                          <InputGroupAddon>
                            €
                          </InputGroupAddon>
                        </InputGroup>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name='dueDate'
                    control={baseForm.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Fecha de vencimiento:</FieldLabel>
                        <DatePicker
                          id={field.name}
                          value={field.value instanceof Date ? toDateOnlyString(field.value) : ''}
                          onChange={(dateStr) => {
                            const newDate = dateStr ? parseLocalDate(dateStr) : undefined
                            field.onChange(newDate)
                            baseForm.trigger('dueDate')
                          }}
                          disabled={isFormDisabled}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Button
                    className='w-min self-end justify-self-end'
                    disabled={JSON.stringify(originalInvoice) === JSON.stringify(invoice) && !baseForm.formState.isDirty}
                    title='Guardar cambios'
                  >
                    <SaveIcon />
                    <span className='lg:hidden'>
                      Guardar cambios
                    </span>
                  </Button>
                </FieldGroup>
              </FieldSet>
            </form>
          </Form>
          <Form {...documentForm}>
            <form onSubmit={documentForm.handleSubmit(onSubmitDocument)} className='col-span-full flex flex-col gap-4'>
              <FieldSet>
                <FieldLegend>Actualizar documento</FieldLegend>
                <FieldGroup className='grid grid-cols-1 lg:grid-cols-[1fr_1fr_minmax(10px,40px)]'>
                  <Controller
                    name='svc'
                    control={documentForm.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>CSV:</FieldLabel>
                        <InputGroup>
                          <InputGroupInput {...field} id={field.name} type='text' placeholder='B12345678-F001-00001234-20260216-A9K3' disabled={isFormDisabled} />
                          <InputGroupAddon>
                            <KeyRoundIcon />
                          </InputGroupAddon>
                          <InputGroupAddon align={'inline-end'}>
                            <Tooltip>
                              <TooltipTrigger className='leading-1'>
                                <CircleQuestionMarkIcon className='w-4 h-4'/>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className='text-center'>Identificador del Registro de Facturación:<br />NIF/CIF/DNI del emisor + Serie + Número factura<br />+ Fecha + Código de verificación</p>
                              </TooltipContent>
                            </Tooltip>
                          </InputGroupAddon>
                        </InputGroup>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name='file'
                    control={documentForm.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Documento:</FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            aria-invalid={fieldState.invalid}
                            id={field.name}
                            onChange={(e) => field.onChange(e.target.files)}
                            onBlur={field.onBlur}
                            ref={field.ref}
                            type='file'
                            accept='image/jpg,image/jpeg,image/png,.pdf'
                            aria-description='Fotocopia que permita visualizar el documento completo'
                            disabled={isFormDisabled}
                          />
                          <InputGroupAddon>
                            <FileIcon />
                          </InputGroupAddon>
                        </InputGroup>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Button
                    className='w-min self-end justify-self-end'
                    disabled={!documentForm.formState.isDirty}
                    title='Actualizar documentos'
                  >
                    <SaveIcon />
                    <span className='lg:hidden'>
                      Actualizar documentos
                    </span>
                  </Button>
                </FieldGroup>
              </FieldSet>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Tabs defaultValue='auctions' className='gap-4'>
        <TabsList>
          <TabsTrigger value='auctions'>Subastas</TabsTrigger>
          <TabsTrigger value='documents'>Documentos</TabsTrigger>
        </TabsList>
        <TabsContent value='auctions'>
          <InvoiceAuctions invoiceSvc={invoice?.svc} />
        </TabsContent>
        <TabsContent value='documents'>
          <InvoiceDocuments invoiceSvc={invoice?.svc} />
        </TabsContent>
      </Tabs>

      {(invoice?.status && invoice.status !== InvoiceStatus.VERIFIED) && (
        <AlertDialog defaultOpen>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Actualización de la factura</AlertDialogTitle>
              <AlertDialogDescription>
                Compruebe el estado de la factura y ejecute las acciones necesarias. Una vez corregida la incidencia, solicite nuevamente la verificación.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Item variant='muted' className='gap-2'>
              <ItemMedia className='self-center! w-10 h-10'>
                {invoiceStatusTextMap[invoice?.status].icon}
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{invoiceStatusTextMap[invoice?.status].title}</ItemTitle>
                <ItemDescription>
                  {invoice?.lastCommunication}
                </ItemDescription>
              </ItemContent>
            </Item>
            <AlertDialogFooter>
              <AlertDialogAction>Aceptar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </section>
  )
}

import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { DateTimeRangePicker } from '@/components/ui/date-time-range-picker'
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Form } from '@/components/ui/form'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import useLocale from '@/hooks/use-locale'
import useLoggedInUser from '@/hooks/use-loggedInUser'
import { formatCurrency } from '@/lib/format-currency'
import { parseLocalDate } from '@/lib/format-date'
import { createAuction } from '@/services/auction.api'
import { getInvoices } from '@/services/invoice.api'
import { type Invoice, InvoiceStatus } from '@/types/Invoice'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckIcon, CopyIcon, GavelIcon, SaveIcon, SearchIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router'
import z from 'zod'

const formSchema = z.object({
  invoiceId: z.string().min(1, 'La factura es obligatoria'),
  startingPrice: z.number().positive('El precio inicial debe ser mayor que 0'),
  auctionDateStart: z.date('La fecha de inicio no es válida').refine((date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selectedDate = new Date(date)
    selectedDate.setHours(0, 0, 0, 0)
    return selectedDate > today
  }, {
    message: 'La fecha de inicio debe ser posterior a la fecha actual'
  }),
  auctionDateEnd: z.date('La fecha de fin no es válida').refine((date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selectedDate = new Date(date)
    selectedDate.setHours(0, 0, 0, 0)
    return selectedDate > today
  }, {
    message: 'La fecha de fin debe ser posterior a la fecha actual'
  })
}).refine((data) => {
  const startDate = new Date(data.auctionDateStart)
  const endDate = new Date(data.auctionDateEnd)

  const nextDay = new Date(startDate)
  nextDay.setDate(nextDay.getDate() + 1)

  return endDate >= nextDay
}, {
  message: 'La fecha de fin de la subasta debe ser al menos un día después de la fecha de inicio'
})

export default function CreateAuctionPage () {
  const [verifiedInvoices, setVerifiedInvoices] = useState<Invoice[]>()
  const [invoiceSearch, setInvoiceSearch] = useState('')
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false)
  const { locale } = useLocale()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: {
      invoiceId: '',
      startingPrice: undefined,
      auctionDateStart: undefined,
      auctionDateEnd: undefined
    }
  })

  const watchedInvoiceId = useWatch({ control: form.control, name: 'invoiceId' })
  const watchedDateStart = useWatch({ control: form.control, name: 'auctionDateStart' })
  const watchedDateEnd = useWatch({ control: form.control, name: 'auctionDateEnd' })

  const selectedInvoice = verifiedInvoices?.find(inv => inv.id === watchedInvoiceId)
  const invoiceDueDate = selectedInvoice?.dueDate

  const auctionEndMaxDate = invoiceDueDate
    ? (() => { const d = parseLocalDate(invoiceDueDate); d.setMonth(d.getMonth() - 1); return d.toISOString() })()
    : undefined

  const auctionStartMinDate = (() => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(0, 0, 0, 0); return d.toISOString() })()

  const loggedInUser = useLoggedInUser()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loggedInUser) return

    const timer = setTimeout(() => {
      setIsLoadingInvoices(true)
      getInvoices({
        sellerInvestorId: loggedInUser.id,
        ...(invoiceSearch ? { invoiceId: invoiceSearch } : {}),
        status: InvoiceStatus.VERIFIED
      })
        .then(res => res.data)
        .then(invoices => setVerifiedInvoices(invoices))
        .finally(() => setIsLoadingInvoices(false))
    }, 300)

    return () => clearTimeout(timer)
  }, [loggedInUser, invoiceSearch])

  function onSubmit (data: z.infer<typeof formSchema>) {
    createAuction(JSON.stringify({
      invoiceId: data.invoiceId,
      startingPrice: data.startingPrice,
      auctionDateStart: data.auctionDateStart.toISOString(),
      auctionDateEnd: data.auctionDateEnd.toISOString()
    }))
      .then(res => navigate(`/user/auctions/${res.data.id}`))
  }

  function applyDiscount (discountPercent: number) {
    if (!selectedInvoice?.amount) return
    const discountedPrice = Math.round(selectedInvoice.amount * (1 - discountPercent / 100) * 100) / 100
    form.setValue('startingPrice', discountedPrice, { shouldDirty: true, shouldTouch: true })
  }

  function copyToClipboard (e: React.MouseEvent<HTMLButtonElement>, text: string | number) {
    e.preventDefault()
    navigator.clipboard.writeText(String(text))
    const button = e.currentTarget
    button.setAttribute('data-copied', 'true')
    setTimeout(() => {
      button.removeAttribute('data-copied')
    }, 2000)
  }

  return (
    <section className='flex flex-col gap-4'>
      <div className='flex items-center gap-2'>
        <span className='rounded-lg p-1 bg-primary/20 text-primary'>
          <GavelIcon className='w-6 h-6' />
        </span>
        <h2>Crear subasta</h2>
      </div>
      <Card>
        <CardHeader>
          <h3>Detalles de la subasta</h3>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4'>
              <FieldSet>
                <FieldLegend>Factura relacionada</FieldLegend>
                <FieldGroup className='grid grid-cols-1 lg:grid-cols-2'>
                  <Controller
                    name='invoiceId'
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Factura:</FieldLabel>
                        <Select
                          value={field.value || '__NONE__'}
                          onValueChange={(value) => field.onChange(value === '__NONE__' ? '' : value)}
                          defaultValue='__NONE__'
                        >
                          <SelectTrigger>
                            {verifiedInvoices?.find(inv => inv.id === field.value)?.invoiceId || 'Selecciona una factura'}
                          </SelectTrigger>
                          <SelectContent>
                            <InputGroup className='border-0 border-b w-full'>
                              <InputGroupInput
                                value={invoiceSearch}
                                onChange={e => setInvoiceSearch(e.target.value)}
                                onKeyDown={e => e.stopPropagation()}
                                onKeyUp={e => e.stopPropagation()}
                                type='text'
                                placeholder='Identificador de factura...'
                                autoComplete='off'
                              />
                              <InputGroupAddon>
                                {isLoadingInvoices ? <Spinner /> : <SearchIcon />}
                              </InputGroupAddon>
                            </InputGroup>
                            <SelectItem value='__NONE__'>
                              <span className='text-muted-foreground'>
                                Selecciona una factura
                              </span>
                            </SelectItem>
                            {verifiedInvoices?.map(inv => (
                              <SelectItem key={inv.id} value={inv.id}>
                                {inv.invoiceId}
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

                  <Field>
                    <FieldLabel htmlFor='invoiceRating'>Rating:</FieldLabel>
                    <InputGroup>
                      <InputGroupInput id='invoiceRating' value={selectedInvoice?.rating} type='text' placeholder='ACME S.L.' required disabled />
                      <InputGroupAddon>
                        %
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor='invoiceAmount'>Importe:</FieldLabel>
                    <InputGroup>
                      <InputGroupInput id='invoiceAmount' value={formatCurrency(selectedInvoice?.amount ?? 0, locale, selectedInvoice?.currency)} type='text' placeholder='0' required disabled />
                      <InputGroupAddon>
                        €
                      </InputGroupAddon>
                      {selectedInvoice?.amount && (
                        <InputGroupAddon align='inline-end'>
                          <button onClick={(e) => copyToClipboard(e, selectedInvoice?.amount ?? '')} className='group'>
                            <CopyIcon className='w-4 h-4 hover:cursor-pointer transition-all absolute top-1/2 right-2 -translate-y-1/2 rotate-0 scale-100 group-data-[copied=true]:-rotate-90 group-data-[copied=true]:scale-0' />

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <CheckIcon className='w-4 h-4 hover:cursor-pointer transition-all absolute top-1/2 right-2 -translate-y-1/2 rotate-90 scale-0 group-data-[copied=true]:rotate-0 group-data-[copied=true]:scale-100' />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className='relative -top-2 right-3'>
                                <p className='text-center'>¡Copiado!</p>
                              </TooltipContent>
                            </Tooltip>
                          </button>
                        </InputGroupAddon>
                      )}
                    </InputGroup>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor='invoiceDueDate'>Fecha de vencimiento:</FieldLabel>
                    <DatePicker id='invoiceDueDate' value={selectedInvoice?.dueDate ?? ''} disabled />
                  </Field>
                </FieldGroup>
              </FieldSet>

              <FieldSet>
                <FieldLegend>Datos de la subasta</FieldLegend>
                <FieldGroup className='grid grid-cols-1 lg:grid-cols-2'>
                  <Controller
                    name='startingPrice'
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Precio inicial:</FieldLabel>
                        <InputGroup>
                          <InputGroupInput
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
                            disabled={!watchedInvoiceId}
                          />
                          <InputGroupAddon>€</InputGroupAddon>
                          <InputGroupAddon align='inline-end'>
                            {selectedInvoice?.amount && field.value !== undefined && !isNaN(field.value) && field.value > 0 &&(
                              <span className='text-sm text-muted-foreground'>
                                {`${new Intl.NumberFormat(locale, { maximumFractionDigits: 2, signDisplay: 'always' }).format((field.value / selectedInvoice.amount - 1) * 100)}%`}
                              </span>
                            )}
                          </InputGroupAddon>
                        </InputGroup>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Field
                    data-invalid={!!(form.formState.errors.auctionDateStart || form.formState.errors.auctionDateEnd)}
                  >
                    <FieldLabel>Periodo de subasta:</FieldLabel>
                    <DateTimeRangePicker
                      fromValue={watchedDateStart instanceof Date ? watchedDateStart.toISOString() : undefined}
                      toValue={watchedDateEnd instanceof Date ? watchedDateEnd.toISOString() : undefined}
                      minDate={auctionStartMinDate}
                      maxDate={auctionEndMaxDate}
                      onFromChange={(isoStr) => {
                        form.setValue('auctionDateStart', (isoStr ? new Date(isoStr) : undefined) as Date, { shouldDirty: true, shouldTouch: true })
                        form.trigger('auctionDateStart')
                        form.trigger('auctionDateEnd')
                      }}
                      onToChange={(isoStr) => {
                        form.setValue('auctionDateEnd', (isoStr ? new Date(isoStr) : undefined) as Date, { shouldDirty: true, shouldTouch: true })
                        form.trigger('auctionDateStart')
                        form.trigger('auctionDateEnd')
                      }}
                      disabled={!watchedInvoiceId}
                    />
                    {form.formState.errors.auctionDateStart && <FieldError errors={[form.formState.errors.auctionDateStart]} />}
                    {form.formState.errors.auctionDateEnd && <FieldError errors={[form.formState.errors.auctionDateEnd]} />}
                  </Field>
                  <div className='flex gap-2'>
                    <ButtonGroup>
                      <Button
                        variant='outline'
                        type='button'
                        onClick={() => applyDiscount(3)}
                        disabled={!watchedInvoiceId}
                      >
                        -3%
                      </Button>
                      <Button
                        variant='outline'
                        type='button'
                        onClick={() => applyDiscount(5)}
                        disabled={!watchedInvoiceId}
                      >
                        -5%
                      </Button>
                      <Button
                        variant='outline'
                        type='button'
                        onClick={() => applyDiscount(10)}
                        disabled={!watchedInvoiceId}
                      >
                        -10%
                      </Button>
                      <Button
                        variant='outline'
                        type='button'
                        onClick={() => applyDiscount(20)}
                        disabled={!watchedInvoiceId}
                      >
                        -20%
                      </Button>
                    </ButtonGroup>
                    <InputGroup className='w-40'>
                      <InputGroupInput
                        type='number'
                        placeholder='Descuento...'
                        disabled={!watchedInvoiceId}
                        onChange={(e) => {
                          const discountPercent = parseFloat(e.target.value) || 0
                          applyDiscount(discountPercent)
                        }}
                      />
                      <InputGroupAddon>-</InputGroupAddon>
                      <InputGroupAddon align='inline-end'>%</InputGroupAddon>
                    </InputGroup>
                  </div>
                  <Button
                    className='w-min ms-auto'
                    disabled={!form.formState.isDirty}
                    title='Crear subasta'
                  >
                    <SaveIcon />
                    Crear subasta
                  </Button>
                </FieldGroup>
              </FieldSet>
            </form>
          </Form>
        </CardContent>
      </Card>
    </section>
  )
}

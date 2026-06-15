import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Form } from '@/components/ui/form'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useLocale } from '@/hooks/use-locale'
import useLoggedInUser from '@/hooks/use-loggedInUser'
import { calculateMaxAllowedPrice } from '@/lib/calculate-max-price'
import { copyToClipboard as performCopyToClipboard } from '@/lib/copy-to-clipboard'
import { formatCurrency } from '@/lib/format-currency'
import { parseLocalDate } from '@/lib/format-date'
import { createAuction } from '@/services/auction.api'
import { getInvoices } from '@/services/invoice.api'
import { type Invoice, InvoiceStatus } from '@/types/Invoice'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckIcon, CircleQuestionMarkIcon, CopyIcon, GavelIcon, SaveIcon, SearchIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router'
import z from 'zod'
import { formatPercentage } from '@/lib/format-percentage.ts'

const formSchema = z.object({
  svc: z.string().min(1, 'La factura es obligatoria'),
  startingPrice: z.number().positive('El precio inicial debe ser mayor que 0'),
  auctionDateEnd: z.date({ error: 'La fecha de fin no es válida' }).refine((date) => {
    const minDate = new Date()
    minDate.setDate(minDate.getDate() + 2)
    minDate.setHours(0, 0, 0, 0)
    const selectedDate = new Date(date)
    selectedDate.setHours(0, 0, 0, 0)
    return selectedDate >= minDate
  }, {
    message: 'La fecha de fin debe ser al menos 2 días desde hoy'
  })
})

function copyToClipboard (e: React.MouseEvent<HTMLButtonElement>, text: string | number) {
  e.preventDefault()
  const button = e.currentTarget
  performCopyToClipboard(text).then(success => {
    if (success) {
      button.setAttribute('data-copied', 'true')
      setTimeout(() => {
        button.removeAttribute('data-copied')
      }, 2000)
    }
  })
}

export default function CreateAuctionPage () {
  const [invoiceState, setInvoiceState] = useState<{ invoices: Invoice[] | undefined; isLoading: boolean }>({ invoices: undefined, isLoading: false })
  const verifiedInvoices = invoiceState.invoices
  const isLoadingInvoices = invoiceState.isLoading
  const [invoiceSearch, setInvoiceSearch] = useState('')
  const { locale } = useLocale()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: {
      svc: '',
      startingPrice: undefined,
      auctionDateEnd: undefined
    }
  })

  const watchedStartingPrice = useWatch({ control: form.control, name: 'startingPrice' })
  const watchedsvc = useWatch({ control: form.control, name: 'svc' })
  const watchedDateEnd = useWatch({ control: form.control, name: 'auctionDateEnd' })

  const selectedInvoice = verifiedInvoices?.find(inv => inv.id === watchedsvc)
  const selectedInvoceSellerFee = selectedInvoice?.transactionFee.sellerPercentage ?? 0
  const invoiceDueDate = selectedInvoice?.dueDate

  const maxAllowedPrice = selectedInvoice
    ? calculateMaxAllowedPrice(
      selectedInvoice.amount,
      selectedInvoice.transactionFee.buyerPercentage,
      selectedInvoice.transactionFee.sellerPercentage,
      Number(import.meta.env.VITE_MINIMUM_INVOICE_DISCOUNT)
    )
    : null

  const auctionEndMaxDate = invoiceDueDate
    ? (() => { const d = parseLocalDate(invoiceDueDate); d.setMonth(d.getMonth() - 1); return d.toISOString() })()
    : undefined

  const auctionEndMinDate = (() => { const d = new Date(); d.setDate(d.getDate() + 2); d.setHours(0, 0, 0, 0); return d.toISOString() })()

  const loggedInUser = useLoggedInUser()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loggedInUser) return

    const timer = setTimeout(() => {
      getInvoices({
        sellerInvestorId: loggedInUser.id,
        ...(invoiceSearch ? { svc: invoiceSearch } : {}),
        status: InvoiceStatus.VERIFIED
      })
        .then(res => res.data)
        .then(invoices => setInvoiceState({ invoices, isLoading: false }))
        .catch(() => setInvoiceState(prev => ({ ...prev, isLoading: false })))
    }, 300)

    return () => clearTimeout(timer)
  }, [loggedInUser, invoiceSearch])

  useEffect(() => {
    if (!maxAllowedPrice || !watchedStartingPrice || watchedStartingPrice <= 0) return
    if (watchedStartingPrice > maxAllowedPrice) {
      form.setError('startingPrice', {
        type: 'max',
        message: 'El precio inicial supera el máximo permitido para esta factura'
      })
    } else if (form.formState.errors.startingPrice?.type === 'max') {
      form.clearErrors('startingPrice')
    }
  }, [watchedStartingPrice, maxAllowedPrice, form])

  function onSubmit (data: z.infer<typeof formSchema>) {
    createAuction(JSON.stringify({
      svc: data.svc,
      startingPrice: data.startingPrice,
      auctionDateEnd: data.auctionDateEnd.toISOString()
    }))
      .then(res => navigate(`/auctions/${res.data.id}`))
  }

  function applyDiscount (discountPercent: number) {
    if (!selectedInvoice?.amount) return
    const discountedPrice = Math.round(selectedInvoice.amount * (1 - discountPercent / 100) * 100) / 100
    const cappedPrice = maxAllowedPrice !== null ? Math.min(discountedPrice, maxAllowedPrice) : discountedPrice
    form.setValue('startingPrice', cappedPrice, { shouldDirty: true, shouldTouch: true })
  }

  return (
    <section className='flex flex-col gap-4'>
      <div className='flex items-center gap-2'>
        <span className='rounded-lg p-1 bg-primary/20 text-primary'>
          <GavelIcon className='size-6' />
        </span>
        <h2>Crear subasta</h2>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4 **:data-[slot=field-group]:grid lg:**:data-[slot=field-group]:grid-cols-2'>
          <Card>
            <CardHeader>
              <h3>Detalles de la subasta</h3>
            </CardHeader>
            <CardContent className='flex flex-col gap-4'>
              <FieldSet>
                <FieldLegend>Factura relacionada</FieldLegend>
                <FieldGroup>
                  <Controller
                    name='svc'
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
                            {verifiedInvoices?.find(inv => inv.id === field.value)?.svc || 'Selecciona una factura'}
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
                              <InputGroupAddon align={'inline-end'}>
                                <Tooltip>
                                  <TooltipTrigger className='leading-1'>
                                    <CircleQuestionMarkIcon className='size-4'/>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className='text-center'>Solo facturas verificadas</p>
                                  </TooltipContent>
                                </Tooltip>
                              </InputGroupAddon>
                            </InputGroup>
                            <SelectItem value='__NONE__'>
                              <span className='text-muted-foreground'>
                                Selecciona una factura
                              </span>
                            </SelectItem>
                            {verifiedInvoices?.map(inv => (
                              <SelectItem key={inv.id} value={inv.id}>
                                {inv.svc}
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
                      <InputGroupInput id='invoiceRating' value={selectedInvoice?.rating ?? ''} type='text' placeholder='ACME S.L.' required disabled />
                      <InputGroupAddon>
                        %
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>
                </FieldGroup>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor='invoiceAmount'>Importe:</FieldLabel>
                    <InputGroup>
                      <InputGroupInput id='invoiceAmount' value={formatCurrency(selectedInvoice?.amount ?? 0, locale, selectedInvoice?.currency)} type='text' placeholder='0' required disabled />
                      <InputGroupAddon>
                        €
                      </InputGroupAddon>
                      {selectedInvoice?.amount && (
                        <InputGroupAddon align='inline-end'>
                          <button type='button' onClick={(e) => copyToClipboard(e, selectedInvoice?.amount ?? '')} className='group'>
                            <CopyIcon className='size-4 hover:cursor-pointer transition-all absolute top-1/2 right-2 -translate-y-1/2 rotate-0 scale-100 group-data-[copied=true]:-rotate-90 group-data-[copied=true]:scale-0' />

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <CheckIcon className='size-4 hover:cursor-pointer transition-all absolute top-1/2 right-2 -translate-y-1/2 rotate-90 scale-0 group-data-[copied=true]:rotate-0 group-data-[copied=true]:scale-100' />
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
                <FieldGroup>
                  <div className='flex flex-col gap-1'>
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
                              disabled={!watchedsvc}
                            />
                            <InputGroupAddon>€</InputGroupAddon>
                            <InputGroupAddon align='inline-end'>
                              {selectedInvoice?.amount && field.value !== undefined && !isNaN(field.value) && field.value > 0 &&(
                                <span className='text-sm text-muted-foreground'>
                                  {`${formatPercentage((field.value / selectedInvoice.amount - 1) * 100)}`}
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
                    <div className='flex items-center justify-between flex-wrap'>
                      {maxAllowedPrice !== null && (
                        <p className='text-xs text-muted-foreground text-right'>
                          Máximo: {formatCurrency(maxAllowedPrice, locale, selectedInvoice?.currency)}
                        </p>
                      )}
                      {watchedStartingPrice > 0 && selectedInvoceSellerFee > 0 && (
                        <div className='text-xs text-muted-foreground flex items-center justify-end gap-4'>
                          <span>Comisión ({Number(selectedInvoceSellerFee).toFixed(2)}%):</span>
                          <span>-{(Number(selectedInvoceSellerFee) / 100 * Number(watchedStartingPrice)).toFixed(2)}€</span>
                        </div>
                      )}
                    </div>
                    <div className='flex flex-col sm:flex-row gap-2'>
                      <ButtonGroup className='w-full sm:w-auto [&_button]:flex-1 sm:[&_button]:flex-0'>
                        <Button
                          variant='outline'
                          type='button'
                          onClick={() => applyDiscount(5)}
                          disabled={!watchedsvc}
                        >
                          -5%
                        </Button>
                        <Button
                          variant='outline'
                          type='button'
                          onClick={() => applyDiscount(7.5)}
                          disabled={!watchedsvc}
                        >
                          -7.5%
                        </Button>
                        <Button
                          variant='outline'
                          type='button'
                          onClick={() => applyDiscount(10)}
                          disabled={!watchedsvc}
                        >
                          -10%
                        </Button>
                        <Button
                          variant='outline'
                          type='button'
                          onClick={() => applyDiscount(20)}
                          disabled={!watchedsvc}
                        >
                          -20%
                        </Button>
                      </ButtonGroup>
                      <InputGroup className='w-40 sm:w-full'>
                        <InputGroupInput
                          type='number'
                          placeholder='Descuento...'
                          disabled={!watchedsvc}
                          onChange={(e) => {
                            const discountPercent = parseFloat(e.target.value) || 0
                            applyDiscount(discountPercent)
                          }}
                        />
                        <InputGroupAddon>-</InputGroupAddon>
                        <InputGroupAddon align='inline-end'>%</InputGroupAddon>
                      </InputGroup>
                    </div>
                  </div>
                  <Field
                    data-invalid={!!form.formState.errors.auctionDateEnd}
                  >
                    <FieldLabel>Fecha de fin de subasta:</FieldLabel>
                    <DateTimePicker
                      value={watchedDateEnd instanceof Date ? watchedDateEnd.toISOString() : undefined}
                      minDate={auctionEndMinDate}
                      maxDate={auctionEndMaxDate}
                      onChange={(isoStr) => {
                        form.setValue('auctionDateEnd', (isoStr ? new Date(isoStr) : undefined) as Date, { shouldDirty: true, shouldTouch: true })
                        form.trigger('auctionDateEnd')
                      }}
                      disabled={!watchedsvc}
                    />
                    {form.formState.errors.auctionDateEnd && <FieldError errors={[form.formState.errors.auctionDateEnd]} />}
                  </Field>
                </FieldGroup>
              </FieldSet>
            </CardContent>
          </Card>

          <Button
            className='w-min ms-auto'
            disabled={!form.formState.isDirty}
            title='Crear subasta'
          >
            <SaveIcon />
            Crear subasta
          </Button>
        </form>
      </Form>
    </section>
  )
}

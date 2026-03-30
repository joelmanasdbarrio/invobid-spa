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
import { useLocale } from '@/hooks/use-locale'
import useLoggedInUser from '@/hooks/use-loggedInUser'
import { formatCurrency } from '@/lib/format-currency'
import { parseLocalDate } from '@/lib/format-date'
import { getAuctionById, updateAuctionById } from '@/services/auction.api'
import { getInvoices } from '@/services/invoice.api'
import { AuctionStatus, type Auction } from '@/types/Auction'
import { InvoiceStatus, type Invoice } from '@/types/Invoice'
import { zodResolver } from '@hookform/resolvers/zod'
import { CircleCheckIcon, GavelIcon, SaveIcon, SearchIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router'
import z from 'zod'

const validateFormSchema = z.object({
  status: z.enum(AuctionStatus)
})

const baseFormSchema = z.object({
  invoiceId: z.string(),
  startingPrice: z.number().positive(),
  auctionDateEnd: z.date('La fecha de vencimiento no es válida').refine((date) => {
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

export default function AuctionPage ({ setLastBreadcrumb }: { setLastBreadcrumb: (breadcrumb: string) => void }) {
  const { auctionId } = useParams<{ auctionId: string }>()
  const [auction, setAuction] = useState<Auction | undefined>()
  const [originalAuction, setOriginalAuction] = useState<Auction | undefined>()
  const [verifiedInvoices, setVerifiedInvoices] = useState<Invoice[]>()
  const [invoiceSearch, setInvoiceSearch] = useState('')
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false)
  const { locale } = useLocale()

  const isFormDisabled = !auction || auction.status !== AuctionStatus.DRAFT

  const validateForm = useForm<z.infer<typeof validateFormSchema>>({
    resolver: zodResolver(validateFormSchema),
    mode: 'onTouched',
    defaultValues: {
      status: auction?.status
    }
  })

  const baseForm = useForm<z.infer<typeof baseFormSchema>>({
    resolver: zodResolver(baseFormSchema),
    mode: 'onTouched',
    defaultValues: {
      invoiceId: auction?.invoice.id || '',
      startingPrice: auction?.startingPrice || 0,
      auctionDateEnd: auction?.auctionDate.auctionDateEnd ? new Date(auction.auctionDate.auctionDateEnd) : undefined
    }
  })

  useEffect(() => {
    baseForm.reset({
      invoiceId: auction?.invoice.id || '',
      startingPrice: auction?.startingPrice || 0,
      auctionDateEnd: auction?.auctionDate.auctionDateEnd ? new Date(auction.auctionDate.auctionDateEnd) : undefined
    })
  }, [auction, baseForm])

  const watchedInvoiceId = useWatch({ control: baseForm.control, name: 'invoiceId' })
  const watchedDateEnd = useWatch({ control: baseForm.control, name: 'auctionDateEnd' })

  const selectedInvoice = verifiedInvoices?.find(inv => inv.id === watchedInvoiceId) ?? auction?.invoice
  const invoiceDueDate = selectedInvoice?.dueDate

  const auctionEndMaxDate = invoiceDueDate
    ? (() => { const d = parseLocalDate(invoiceDueDate); d.setMonth(d.getMonth() - 1); return d.toISOString() })()
    : undefined

  const auctionEndMinDate = (() => { const d = new Date(); d.setDate(d.getDate() + 2); d.setHours(0, 0, 0, 0); return d.toISOString() })()

  const loggedInUser = useLoggedInUser()
  const navigate = useNavigate()

  useEffect(() => {
    if (!auctionId || !loggedInUser) return
    getAuctionById(auctionId)
      .then(res => res.data)
      .then(auction => {
        setAuction(auction)
        setOriginalAuction(auction)
        setLastBreadcrumb(`Subasta ${auction.invoice.invoiceId}`)
      })
      .catch(() => {
        navigate('/user/auctions')
      })
  }, [auctionId, loggedInUser, navigate, setLastBreadcrumb])

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

  function applyDiscount (discountPercent: number) {
    if (!selectedInvoice?.amount) return
    const discountedPrice = Math.round(selectedInvoice.amount * (1 - discountPercent / 100) * 100) / 100
    baseForm.setValue('startingPrice', discountedPrice, { shouldDirty: true, shouldTouch: true })
  }

  function onSubmitBase (data: z.infer<typeof baseFormSchema>) {
    if (!auctionId) return
    updateAuctionById(auctionId, JSON.stringify({
      invoiceId: data.invoiceId,
      startingPrice: data.startingPrice,
      auctionDateEnd: data.auctionDateEnd.toISOString()
    }))
      .then(res => {
        setAuction(res.data)
        setOriginalAuction(res.data)
      })
      .then(() => navigate(`/user/auctions/${auctionId}`))
  }

  function onSubmitValidate (data: z.infer<typeof validateFormSchema>) {
    if (!auctionId) return
    updateAuctionById(auctionId, JSON.stringify({
      status: data.status
    }))
      .then(res => setAuction(res.data))
      .then(() => navigate(`/user/auctions/${auctionId}`))
  }

  return (
    <section className='flex flex-col gap-4'>
      <div className='flex items-center gap-2'>
        <span className='rounded-lg p-1 bg-primary/20 text-primary'>
          <GavelIcon className='w-6 h-6' />
        </span>
        <h2>Gestionar subasta</h2>
      </div>
      <Card>
        <CardHeader className='md:grid-cols-[auto_1fr] grid-rows-1'>
          <h3>Detalles de la subasta <span className='text-primary'>{auction?.invoice?.invoiceUid}</span></h3>
          {auction?.status === AuctionStatus.DRAFT && (
            <Form {...validateForm}>
              <form onSubmit={validateForm.handleSubmit(onSubmitValidate)} className='ms-auto flex md:justify-end'>
                <Button
                  variant='outline'
                  className='group md:w-10 md:hover:w-full md:max-w-min md:gap-0 md:hover:gap-2 duration-200'
                  disabled={!auction}
                  onClick={() => {
                    validateForm.setValue('status', AuctionStatus.PUBLISHED)
                    validateForm.handleSubmit(onSubmitValidate)()
                  }}
                >
                  <CircleCheckIcon className='shrink-0' />
                  <span className='overflow-hidden'>
                    Publicar
                  </span>
                </Button>
              </form>
            </Form>
          )}
        </CardHeader>
        <CardContent>
          <Form {...baseForm}>
            <form onSubmit={baseForm.handleSubmit(onSubmitBase)} className='flex flex-col gap-4'>
              <FieldSet>
                <FieldLegend>Factura relacionada</FieldLegend>
                <FieldGroup className='grid grid-cols-1 lg:grid-cols-2'>
                  <Controller
                    name='invoiceId'
                    control={baseForm.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Factura:</FieldLabel>
                        <Select
                          value={verifiedInvoices?.find(inv => inv.id === field.value)?.id || auction?.invoice?.id || '__NONE__'}
                          onValueChange={(value) => field.onChange(value === '__NONE__' ? '' : value)}
                          defaultValue={field.value || ''}
                          disabled={isFormDisabled}
                        >
                          <SelectTrigger>
                            {verifiedInvoices?.find(inv => inv.id === field.value)?.invoiceUid || auction?.invoice?.invoiceUid || 'Selecciona una factura'}
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
                                {inv.invoiceUid}
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
                      <InputGroupInput id='invoiceRating' value={selectedInvoice?.rating} type='text' required disabled />
                      <InputGroupAddon>%</InputGroupAddon>
                    </InputGroup>
                  </Field>
                  <Field className='col-start-1'>
                    <FieldLabel htmlFor='invoiceAmount'>Importe:</FieldLabel>
                    <InputGroup>
                      <InputGroupInput id='invoiceAmount' value={formatCurrency(selectedInvoice?.amount ?? 0, locale, selectedInvoice?.currency)} type='text' required disabled />
                      <InputGroupAddon>€</InputGroupAddon>
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
                    control={baseForm.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Precio inicial:</FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            type='number'
                            step='0.01'
                            placeholder='1000'
                            disabled={isFormDisabled}
                            value={field.value}
                            onChange={e => field.onChange(e.target.valueAsNumber)}
                            onBlur={() => {
                              if (field.value !== undefined && !isNaN(field.value)) {
                                field.onChange(Math.round(field.value * 100) / 100)
                              }
                              field.onBlur()
                            }}
                            ref={field.ref}
                          />
                          <InputGroupAddon>€</InputGroupAddon>
                          <InputGroupAddon align='inline-end'>
                            {field.value !== undefined && selectedInvoice?.amount && (
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
                    data-invalid={!!baseForm.formState.errors.auctionDateEnd}
                  >
                    <FieldLabel>Fecha de fin de subasta:</FieldLabel>
                    <DateTimePicker
                      value={watchedDateEnd instanceof Date ? watchedDateEnd.toISOString() : undefined}
                      minDate={auctionEndMinDate}
                      maxDate={auctionEndMaxDate}
                      onChange={(isoStr) => {
                        baseForm.setValue('auctionDateEnd', (isoStr ? new Date(isoStr) : undefined) as Date, { shouldDirty: true, shouldTouch: true })
                        baseForm.trigger('auctionDateEnd')
                      }}
                      disabled={isFormDisabled}
                    />
                    {baseForm.formState.errors.auctionDateEnd && <FieldError errors={[baseForm.formState.errors.auctionDateEnd]} />}
                  </Field>
                  <div className='flex gap-2'>
                    <ButtonGroup>
                      <Button
                        variant='outline'
                        type='button'
                        onClick={() => applyDiscount(3)}
                        disabled={isFormDisabled}
                      >
                        -3%
                      </Button>
                      <Button
                        variant='outline'
                        type='button'
                        onClick={() => applyDiscount(5)}
                        disabled={isFormDisabled}
                      >
                        -5%
                      </Button>
                      <Button
                        variant='outline'
                        type='button'
                        onClick={() => applyDiscount(10)}
                        disabled={isFormDisabled}
                      >
                        -10%
                      </Button>
                      <Button
                        variant='outline'
                        type='button'
                        onClick={() => applyDiscount(20)}
                        disabled={isFormDisabled}
                      >
                        -20%
                      </Button>
                    </ButtonGroup>
                    <InputGroup className='w-40'>
                      <InputGroupInput
                        type='number'
                        placeholder='Descuento...'
                        disabled={isFormDisabled}
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
                    className='w-min self-end justify-self-end'
                    disabled={JSON.stringify(originalAuction) === JSON.stringify(auction) && !baseForm.formState.isDirty}
                    title='Guardar cambios'
                  >
                    <SaveIcon />
                    <span>
                      Guardar cambios
                    </span>
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

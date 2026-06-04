import { ColorBadge } from '@/components/color-badge'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useLocale } from '@/hooks/use-locale'
import useLoggedInUser from '@/hooks/use-loggedInUser'
import { formatCurrency } from '@/lib/format-currency'
import { parseLocalDate } from '@/lib/format-date'
import { getAuctionById, updateAuctionById } from '@/services/auction.api'
import { getInvoices } from '@/services/invoice.api'
import { AuctionStatus, type Auction } from '@/types/Auction'
import { InvoiceStatus, type Invoice } from '@/types/Invoice'
import { zodResolver } from '@hookform/resolvers/zod'
import { CircleCheckIcon, CircleDashedIcon, CircleGaugeIcon, CircleSlashIcon, GavelIcon, SaveIcon, SearchIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router'
import z from 'zod'
import { AuctionBids } from './components/auction-bids/auction-bids'
import { AuctionInvoices } from './components/auction-invoices/auction-invoices'

const validateFormSchema = z.object({
  status: z.enum(AuctionStatus)
})

const baseFormSchema = z.object({
  svc: z.string(),
  startingPrice: z.number().positive(),
  auctionDateEnd: z.date({ error: 'La fecha de vencimiento no es válida' }).refine((date) => {
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
  const [auctionState, setAuctionState] = useState<{ auction: Auction | undefined; originalAuction: Auction | undefined }>({ auction: undefined, originalAuction: undefined })
  const auction = auctionState.auction
  const originalAuction = auctionState.originalAuction
  const setAuction = (a: Auction | undefined) => setAuctionState(prev => ({ ...prev, auction: a }))
  const [invoiceState, setInvoiceState] = useState<{ invoices: Invoice[] | undefined; isLoading: boolean }>({ invoices: undefined, isLoading: false })
  const verifiedInvoices = invoiceState.invoices
  const isLoadingInvoices = invoiceState.isLoading
  const [invoiceSearch, setInvoiceSearch] = useState('')
  const { locale } = useLocale()
  const percentFormatter = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 2, signDisplay: 'always' }),
    [locale]
  )

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
      svc: auction?.invoice.id || '',
      startingPrice: auction?.price?.start || 0,
      auctionDateEnd: auction?.date.end ? new Date(auction.date.end) : undefined
    }
  })

  useEffect(() => {
    baseForm.reset({
      svc: auction?.invoice.id || '',
      startingPrice: auction?.price?.start || 0,
      auctionDateEnd: auction?.date.end ? new Date(auction.date.end) : undefined
    })
  }, [auction, baseForm])

  const watchedStartingPrice = useWatch({ control: baseForm.control, name: 'startingPrice' })
  const watchedsvc = useWatch({ control: baseForm.control, name: 'svc' })
  const watchedDateEnd = useWatch({ control: baseForm.control, name: 'auctionDateEnd' })

  const selectedInvoice = verifiedInvoices?.find(inv => inv.id === watchedsvc) ?? auction?.invoice
  const selectedInvoceSellerFee = selectedInvoice?.transactionFee.sellerPercentage ?? 0
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
        setAuctionState({ auction, originalAuction: auction })
        setLastBreadcrumb(`Subasta de factura ${auction.invoice.svc}`)
      })
      .catch(() => {
        navigate('/user/auctions')
      })
  }, [auctionId, loggedInUser, navigate, setLastBreadcrumb])

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

  function applyDiscount (discountPercent: number) {
    if (!selectedInvoice?.amount) return
    const discountedPrice = Math.round(selectedInvoice.amount * (1 - discountPercent / 100) * 100) / 100
    baseForm.setValue('startingPrice', discountedPrice, { shouldDirty: true, shouldTouch: true })
  }

  function onSubmitBase (data: z.infer<typeof baseFormSchema>) {
    if (!auctionId) return
    updateAuctionById(auctionId, JSON.stringify({
      svc: data.svc,
      startingPrice: data.startingPrice,
      auctionDateEnd: data.auctionDateEnd.toISOString()
    }))
      .then(res => {
        setAuctionState({ auction: res.data, originalAuction: res.data })
      })
      .then(() => navigate(`/auctions/${auctionId}`))
  }

  function onSubmitValidate (data: z.infer<typeof validateFormSchema>) {
    if (!auctionId) return
    updateAuctionById(auctionId, JSON.stringify({
      status: data.status
    }))
      .then(res => setAuction(res.data))
      .then(() => navigate(`/auctions/${auctionId}`))
  }

  return (
    <section className='flex flex-col gap-4'>
      <div className='flex items-center gap-2'>
        <span className='rounded-lg p-1 bg-primary/20 text-primary'>
          <GavelIcon className='size-6' />
        </span>
        <h2>Gestionar subasta</h2>
        {auction?.status === AuctionStatus.DRAFT && (
          <Form {...validateForm}>
            <form onSubmit={validateForm.handleSubmit(onSubmitValidate)} className='ms-auto flex md:justify-end'>
              <Button
                variant='outline'
                className='group'
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
      </div>
      <Form {...baseForm}>
        <form onSubmit={baseForm.handleSubmit(onSubmitBase)} className='flex flex-col gap-4 **:data-[slot=field-group]:grid lg:**:data-[slot=field-group]:grid-cols-2'>
          <Card>
            <CardHeader>
              <div className='flex flex-wrap gap-2 items-center'>
                <h3>Detalles de la subasta <span className='text-primary'>{auction?.invoice?.svc}</span></h3>
                <div className='ms-auto'>
                  {auction?.status === AuctionStatus.DRAFT && (
                    <ColorBadge color='yellow' icon={<CircleDashedIcon />}>
                      Borrador
                    </ColorBadge>
                  )}
                  {auction?.status === AuctionStatus.PUBLISHED && (
                    <ColorBadge color='green' icon={<CircleCheckIcon />}>
                      Publicada
                    </ColorBadge>
                  )}
                  {auction?.status === AuctionStatus.TRANSITIONING && (
                    <ColorBadge color='blue' icon={<CircleGaugeIcon />}>
                      En transición
                    </ColorBadge>
                  )}
                  {auction?.status === AuctionStatus.CANCELLED && (
                    <ColorBadge color='red' icon={<CircleSlashIcon />}>
                      Cancelada
                    </ColorBadge>
                  )}
                  {auction?.status === AuctionStatus.FINISHED && (
                    <ColorBadge color='purple' icon={<GavelIcon />}>
                      Finalizada
                    </ColorBadge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className='flex flex-col gap-4'>
              <FieldSet>
                <FieldLegend>Factura relacionada</FieldLegend>
                <FieldGroup>
                  <Controller
                    name='svc'
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
                            {verifiedInvoices?.find(inv => inv.id === field.value)?.svc || auction?.invoice?.svc || 'Selecciona una factura'}
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
                      <InputGroupInput id='invoiceRating' value={selectedInvoice?.rating ?? ''} type='text' required disabled />
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
                <FieldGroup>
                  <div className='flex flex-col gap-2'>
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
                              value={field.value ?? ''}
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
                                  {`${percentFormatter.format((field.value / selectedInvoice.amount - 1) * 100)}%`}
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
                    {watchedStartingPrice > 0 && selectedInvoceSellerFee > 0 && (
                      <div className='text-xs text-muted-foreground flex items-center justify-end gap-4'>
                        <span>Comisión ({Number(selectedInvoceSellerFee).toFixed(2)}%):</span>
                        <span>-{(Number(selectedInvoceSellerFee) / 100 * Number(watchedStartingPrice)).toFixed(2)}€</span>
                      </div>
                    )}
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
                      <InputGroup className='w-full'>
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
                  </div>
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
                </FieldGroup>
              </FieldSet>
            </CardContent>
          </Card>
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
        </form>
      </Form>

      <Tabs defaultValue='bids' className='gap-4'>
        <TabsList>
          <TabsTrigger value='bids'>Pujas</TabsTrigger>
          <TabsTrigger value='invoices'>Facturas</TabsTrigger>
        </TabsList>
        <TabsContent value='bids'>
          <AuctionBids auctionId={auctionId} />
        </TabsContent>
        <TabsContent value='invoices'>
          <AuctionInvoices invoiceSvc={auction?.invoice?.svc} />
        </TabsContent>
      </Tabs>
    </section>
  )
}

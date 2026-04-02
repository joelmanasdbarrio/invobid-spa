import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Form } from '@/components/ui/form'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupTextarea } from '@/components/ui/input-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useLocale } from '@/hooks/use-locale'
import { formatCurrency } from '@/lib/format-currency'
import { getAuctionById, updateAuctionById } from '@/services/auction.api'
import { AuctionStatus, type Auction } from '@/types/Auction'
import { zodResolver } from '@hookform/resolvers/zod'
import { BuildingIcon, CheckIcon, CircleCheckIcon, CircleDashedIcon, CircleGaugeIcon, CircleSlashIcon, CopyIcon, ExternalLinkIcon, GavelIcon, IdCardIcon, SaveIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router'
import z from 'zod'
import { AuctionBidHistory } from './components/auction-bid-history/auction-bid-history'
import { AuctionChangeHistory } from './components/auction-change-history'

const formSchema = z.object({
  status: z.enum(AuctionStatus).optional(),
  lastCommunication: z.string().optional()
})

export default function AdminAuctionPage ({ setLastBreadcrumb }: { setLastBreadcrumb: (breadcrumb: string) => void }) {
  const {auctionId} = useParams()
  const [auction, setAuction] = useState<Auction | undefined>()
  const [originalAuction, setOriginalAuction] = useState<Auction | undefined>()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { locale } = useLocale()

  const navigate = useNavigate()
  useEffect(() => {
    if (auctionId) {
      getAuctionById(auctionId)
        .then(res => res.data)
        .then(auction => {
          setAuction(auction)
          setOriginalAuction(auction)
          setLastBreadcrumb(auction.invoice.invoiceUid)
        })
        .catch(() => {
          navigate('/admin/auctions')
        })
    }
  }, [auctionId, navigate, setLastBreadcrumb])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: {
      status: auction?.status ?? undefined,
      lastCommunication: ''
    }
  })

  useEffect(() => {
    form.reset({
      status: auction?.status ?? undefined,
      lastCommunication: ''
    })
  }, [auction, form])

  function onSubmit (data: z.infer<typeof formSchema>) {
    if (!auction) return

    const updateData = {
      status: data.status ?? auction.status,
      ...(data.lastCommunication && { lastCommunication: data.lastCommunication })
    }

    updateAuctionById(auction.id, JSON.stringify(updateData))
      .then(res => res.data)
      .then(updatedAuction => {
        setAuction(updatedAuction)
        setOriginalAuction(updatedAuction)
        form.reset({
          status: updatedAuction.status ?? undefined,
          lastCommunication: ''
        })
        setIsDialogOpen(false)
      })
      .then(() => navigate(`/admin/auctions/${auction.id}`))
  }

  function handleReset () {
    form.reset()
    setAuction(originalAuction)
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

  // Helper: Get the latest bid
  const getLatestBid = () => {
    if (!auction || !auction.bids || auction.bids.length === 0) return null
    return auction.bids.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
  }

  // Helper: Get display ending price based on auction status
  const getDisplayEndingPrice = (): number | undefined => {
    if (!auction) return undefined
    if (auction.status === AuctionStatus.FINISHED) {
      return auction.price.end
    }
    // For TRANSITIONING and PUBLISHED, show latest bid amount
    const latestBid = getLatestBid()
    return latestBid?.amount
  }

  // Helper: Get display ending discount based on auction status
  const getDisplayEndingDiscount = (): number | undefined => {
    if (!auction) return undefined
    if (auction.status === AuctionStatus.FINISHED) {
      return auction.discount.end
    }
    // For TRANSITIONING and PUBLISHED, show latest bid discount
    const latestBid = getLatestBid()
    return latestBid?.discount
  }

  // Helper: Get display ending profitability based on auction status
  const getDisplayEndingProfitability = (): number | undefined => {
    if (!auction) return undefined
    if (auction.status === AuctionStatus.FINISHED) {
      return auction.profitability.end
    }
    // For TRANSITIONING and PUBLISHED, show latest bid profitability
    const latestBid = getLatestBid()
    return latestBid?.profitability
  }

  // Helper: Get ending price label based on auction status
  const getEndingPriceLabel = () => {
    if (!auction) return 'Precio de cierre'
    if (auction.status === AuctionStatus.FINISHED) return 'Precio de cierre'
    return 'Oferta más reciente'
  }

  // Helper: Get ending discount label based on auction status
  const getEndingDiscountLabel = () => {
    if (!auction) return 'Descuento de cierre'
    if (auction.status === AuctionStatus.FINISHED) return 'Descuento de cierre'
    return 'Descuento de oferta más reciente'
  }

  // Helper: Get ending profitability label based on auction status
  const getEndingProfitabilityLabel = () => {
    if (!auction) return 'Rentabilidad de cierre'
    if (auction.status === AuctionStatus.FINISHED) return 'Rentabilidad de cierre'
    return 'Rentabilidad de oferta más reciente'
  }

  const updateNotesMap: Record<string, string> = { }

  return (
    <section className='flex flex-col gap-4'>
      <div className='flex items-center gap-2'>
        <span className='rounded-lg p-1 bg-primary/20 text-primary'>
          <GavelIcon className='w-6 h-6' />
        </span>
        <h2>Gestionar subasta</h2>
      </div>
      <div className='grid xl:grid-cols-3 gap-4'>
        <Card className='xl:col-span-2'>
          {auction && (
            <Form {...form}>
              <form id='auction-form' onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <CardHeader className='flex flex-col xl:flex-row gap-2'>
                  <h3>Detalle de la subasta <span className='text-primary'>{auction.invoice.invoiceUid}</span></h3>
                  <ButtonGroup className='xl:ms-auto flex-row-reverse xl:flex-row'>
                    <ButtonGroup>
                      <Button type='button' title='Borrador' disabled variant='outline' className='bg-yellow-300/25 dark:bg-yellow-300/25' onClick={() => form.setValue('status', AuctionStatus.DRAFT, { shouldDirty: true })}>
                        <CircleDashedIcon className='w-5 h-5 rounded-full text-yellow-600'/>
                        {form.watch('status') === AuctionStatus.DRAFT && 'Borrador'}
                      </Button>
                      <Button type='button' title='Publicada' disabled variant='outline' className='bg-green-300/25 dark:bg-green-300/25' onClick={() => form.setValue('status', AuctionStatus.PUBLISHED, { shouldDirty: true })}>
                        <CircleCheckIcon className='w-5 h-5 rounded-full text-green-600'/>
                        {form.watch('status') === AuctionStatus.PUBLISHED && 'Publicada'}
                      </Button>
                      <Button type='button' title='En transición' disabled variant='outline' className='bg-blue-300/25 dark:bg-blue-300/25' onClick={() => form.setValue('status', AuctionStatus.TRANSITIONING, { shouldDirty: true })}>
                        <CircleGaugeIcon className='w-5 h-5 rounded-full text-blue-600'/>
                        {form.watch('status') === AuctionStatus.TRANSITIONING && 'En transición'}
                      </Button>
                      <Button type='button' title='Cancelada' variant='outline' className='bg-red-300/25 dark:bg-red-300/25' onClick={() => form.setValue('status', AuctionStatus.CANCELLED, { shouldDirty: true })}>
                        <CircleSlashIcon className='w-5 h-5 rounded-full text-red-600'/>
                        {form.watch('status') === AuctionStatus.CANCELLED && 'Cancelada'}
                      </Button>
                      <Button type='button' title='Finalizada' variant='outline' className='bg-violet-300/25 dark:bg-violet-300/25' onClick={() => form.setValue('status', AuctionStatus.FINISHED, { shouldDirty: true })}>
                        <GavelIcon className='w-5 h-5 rounded-full text-violet-600'/>
                        {form.watch('status') === AuctionStatus.FINISHED && 'Finalizada'}
                      </Button>
                    </ButtonGroup>
                  </ButtonGroup>
                </CardHeader>

                <CardContent className='flex flex-col gap-4'>
                  <FieldSet>
                    <FieldGroup className='flex flex-col gap-4 xl:grid xl:grid-cols-2'>
                      <Field>
                        <FieldLabel>Fecha inicio</FieldLabel>
                        <DateTimePicker
                          value={auction.date.start}
                          disabled
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Fecha fin</FieldLabel>
                        <DateTimePicker
                          value={auction.date.end}
                          disabled
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Precio de salida</FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            value={formatCurrency(auction.price.start, locale, auction.invoice.currency) ?? ''}
                            disabled
                          />
                          <InputGroupAddon>
                            €
                          </InputGroupAddon>
                        </InputGroup>
                      </Field>
                      <Field>
                        <FieldLabel>{getEndingPriceLabel()}</FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            value={formatCurrency(getDisplayEndingPrice() ?? 0, locale, auction.invoice.currency) ?? ''}
                            disabled
                          />
                          <InputGroupAddon>
                            €
                          </InputGroupAddon>
                        </InputGroup>
                      </Field>
                      <Field>
                        <FieldLabel>Descuento de salida</FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            value={auction.discount.start != null ? new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(Number(auction.discount.start)) : ''}
                            disabled
                          />
                          <InputGroupAddon>
                            %
                          </InputGroupAddon>
                        </InputGroup>
                      </Field>
                      <Field>
                        <FieldLabel>{getEndingDiscountLabel()}</FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            value={getDisplayEndingDiscount() != null ? new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(Number(getDisplayEndingDiscount())) : ''}
                            disabled
                          />
                          <InputGroupAddon>
                            %
                          </InputGroupAddon>
                        </InputGroup>
                      </Field>
                      <Field>
                        <FieldLabel>Rentabilidad de salida</FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            value={auction.profitability.start != null ? new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(Number(auction.profitability.start)) : ''}
                            disabled
                          />
                          <InputGroupAddon>
                            %
                          </InputGroupAddon>
                        </InputGroup>
                      </Field>
                      <Field>
                        <FieldLabel>{getEndingProfitabilityLabel()}</FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            value={getDisplayEndingProfitability() != null ? new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(Number(getDisplayEndingProfitability())) : ''}
                            disabled
                          />
                          <InputGroupAddon>
                            %
                          </InputGroupAddon>
                        </InputGroup>
                      </Field>
                    </FieldGroup>
                  </FieldSet>
                  <Accordion type='multiple'>
                    <FieldSet>
                      <AccordionItem value='seller'>
                        <AccordionTrigger>
                          <div>
                            <FieldLegend>Información del cedente</FieldLegend>
                            <FieldDescription>Cedente que vende la factura</FieldDescription>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>

                          <FieldGroup className='flex flex-col gap-4 xl:grid xl:grid-cols-2'>
                            <Field>
                              <FieldLabel htmlFor='investorTaxId'>CIF/NIF:</FieldLabel>
                              <InputGroup>
                                <InputGroupInput id='investorTaxId' value={auction.invoice.sellerInvestor.taxId} type='text' placeholder='12345678A' required disabled />
                                <InputGroupAddon>
                                  <IdCardIcon />
                                </InputGroupAddon>
                                <InputGroupAddon align='inline-end'>
                                  <button onClick={(e) => copyToClipboard(e, auction.invoice.sellerInvestor.taxId ?? '')} className='group'>
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
                              </InputGroup>
                            </Field>
                            <Field>
                              <FieldLabel htmlFor='investorCompanyName'>Razón social:</FieldLabel>
                              <InputGroup>
                                <InputGroupInput id='investorCompanyName' value={auction.invoice.sellerInvestor.companyName} type='text' placeholder='ACME S.L.' required disabled />
                                <InputGroupAddon>
                                  <BuildingIcon />
                                </InputGroupAddon>
                                <InputGroupAddon align='inline-end'>
                                  <button onClick={(e) => copyToClipboard(e, auction.invoice.sellerInvestor.companyName ?? '')} className='group'>
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
                              </InputGroup>
                            </Field>
                            <FieldDescription>
                              <Link to={`/admin/users/${auction.invoice.sellerInvestor?.id}`} className='text-xs'>
                                Consultar cedente
                                <ExternalLinkIcon className='w-3 h-3 inline-block ml-1' />
                              </Link>
                            </FieldDescription>
                          </FieldGroup>
                        </AccordionContent>
                      </AccordionItem>
                    </FieldSet>
                    <FieldSet>
                      <AccordionItem value='debtor'>
                        <AccordionTrigger>
                          <div>
                            <FieldLegend>Información del deudor</FieldLegend>
                            <FieldDescription>Deudor asociado a la factura</FieldDescription>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <FieldGroup className='flex flex-col gap-4 xl:grid xl:grid-cols-2'>
                            <Field>
                              <FieldLabel htmlFor='debtorTaxId'>CIF/NIF:</FieldLabel>
                              <InputGroup>
                                <InputGroupInput id='debtorTaxId' value={auction.invoice.debtor.taxId} type='text' placeholder='12345678A' required disabled />
                                <InputGroupAddon>
                                  <IdCardIcon />
                                </InputGroupAddon>
                                <InputGroupAddon align='inline-end'>
                                  <button onClick={(e) => copyToClipboard(e, auction.invoice.debtor.taxId ?? '')} className='group'>
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
                              </InputGroup>
                            </Field>
                            <Field>
                              <FieldLabel htmlFor='debtorCompanyName'>Razón social:</FieldLabel>
                              <InputGroup>
                                <InputGroupInput id='debtorCompanyName' value={auction.invoice.debtor.companyName} type='text' placeholder='ACME S.L.' required disabled />
                                <InputGroupAddon>
                                  <BuildingIcon />
                                </InputGroupAddon>
                                <InputGroupAddon align='inline-end'>
                                  <button onClick={(e) => copyToClipboard(e, auction.invoice.debtor.companyName ?? '')} className='group'>
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
                              </InputGroup>
                            </Field>
                            <FieldDescription>
                              <Link to={`/admin/debtors/${auction.invoice.debtor?.id}`} className='text-xs'>
                                Consultar deudor
                                <ExternalLinkIcon className='w-3 h-3 inline-block ml-1' />
                              </Link>
                            </FieldDescription>
                          </FieldGroup>
                        </AccordionContent>
                      </AccordionItem>
                    </FieldSet>
                    <FieldSet>
                      <AccordionItem value='invoice'>
                        <AccordionTrigger>
                          <div>
                            <FieldLegend>Información de la factura</FieldLegend>
                            <FieldDescription>Factura asociada a la subasta</FieldDescription>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <FieldGroup className='flex flex-col gap-4 xl:grid xl:grid-cols-2'>
                            <Field>
                              <FieldLabel htmlFor='invoiceUid'>UID de factura:</FieldLabel>
                              <InputGroup>
                                <InputGroupInput id='invoiceUid' value={auction.invoice.invoiceUid} type='text' placeholder='A1B2C3D4E5F6G7H8' required disabled />
                                <InputGroupAddon>
                                  #
                                </InputGroupAddon>
                                <InputGroupAddon align='inline-end'>
                                  <button onClick={(e) => copyToClipboard(e, auction.invoice.invoiceUid ?? '')} className='group'>
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
                              </InputGroup>
                            </Field>
                            <Field>
                              <FieldLabel htmlFor='invoiceRating'>Rating:</FieldLabel>
                              <InputGroup>
                                <InputGroupInput id='invoiceRating' value={auction.invoice?.rating} type='text' placeholder='ACME S.L.' required disabled />
                                <InputGroupAddon>
                                  %
                                </InputGroupAddon>
                                <InputGroupAddon align='inline-end'>
                                  <button onClick={(e) => copyToClipboard(e, auction.invoice?.rating ?? '')} className='group'>
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
                              </InputGroup>
                            </Field>
                            <Field>
                              <FieldLabel htmlFor='invoiceDueDate'>Fecha de vencimiento:</FieldLabel>
                              <DatePicker id='invoiceDueDate' value={auction.invoice?.dueDate ?? ''} disabled />
                            </Field>
                            <Field>
                              <FieldLabel htmlFor='invoiceAmount'>Importe:</FieldLabel>
                              <InputGroup>
                                <InputGroupInput id='invoiceAmount' value={formatCurrency(auction.invoice?.amount ?? 0, locale, auction.invoice?.currency)} type='text' placeholder='0' required disabled />
                                <InputGroupAddon>
                                  €
                                </InputGroupAddon>
                                <InputGroupAddon align='inline-end'>
                                  <button onClick={(e) => copyToClipboard(e, auction.invoice?.amount ?? '')} className='group'>
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
                              </InputGroup>
                            </Field>
                            <FieldDescription>
                              <Link to={`/admin/invoices/${auction.invoice?.id}`} className='text-xs'>
                                Consultar factura
                                <ExternalLinkIcon className='w-3 h-3 inline-block ml-1' />
                              </Link>
                            </FieldDescription>
                          </FieldGroup>
                        </AccordionContent>
                      </AccordionItem>
                    </FieldSet>
                    {auction.invoice.buyerInvestor && (
                      <FieldSet>
                        <AccordionItem value='investor'>
                          <AccordionTrigger>
                            <div>
                              <FieldLegend>Información del inversor</FieldLegend>
                              <FieldDescription>Inversor que adquirió la factura</FieldDescription>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <FieldGroup className='flex flex-col gap-4 xl:grid xl:grid-cols-2'>
                              <Field>
                                <FieldLabel htmlFor='investorTaxId'>CIF/NIF:</FieldLabel>
                                <InputGroup>
                                  <InputGroupInput id='investorTaxId' value={auction.invoice.buyerInvestor?.taxId} type='text' placeholder='12345678A' required disabled />
                                  <InputGroupAddon>
                                    <IdCardIcon />
                                  </InputGroupAddon>
                                  <InputGroupAddon align='inline-end'>
                                    <button onClick={(e) => copyToClipboard(e, auction.invoice.buyerInvestor?.taxId ?? '')} className='group'>
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
                                </InputGroup>
                              </Field>
                              <Field>
                                <FieldLabel htmlFor='investorCompanyName'>Razón social:</FieldLabel>
                                <InputGroup>
                                  <InputGroupInput id='investorCompanyName' value={auction.invoice.buyerInvestor?.companyName} type='text' placeholder='ACME S.L.' required disabled />
                                  <InputGroupAddon>
                                    <BuildingIcon />
                                  </InputGroupAddon>
                                  <InputGroupAddon align='inline-end'>
                                    <button onClick={(e) => copyToClipboard(e, auction.invoice.buyerInvestor?.companyName ?? '')} className='group'>
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
                                </InputGroup>
                              </Field>
                              <FieldDescription>
                                <Link to={`/admin/users/${auction.invoice.buyerInvestor?.id}`} className='text-xs'>
                                  Consultar inversor
                                  <ExternalLinkIcon className='w-3 h-3 inline-block ml-1' />
                                </Link>
                              </FieldDescription>
                            </FieldGroup>
                          </AccordionContent>
                        </AccordionItem>
                      </FieldSet>
                    )}
                  </Accordion>
                  <FieldSet>
                    <FieldGroup>
                      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className='ms-auto w-min' disabled={JSON.stringify(originalAuction) === JSON.stringify(auction) && !form.formState.isDirty}>
                            <SaveIcon />
                            Guardar cambios
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>¿Estás seguro de que deseas guardar los cambios?</DialogTitle>
                          </DialogHeader>
                          <DialogDescription>Esta acción actualizará la información de la subasta en el sistema, comprueba siempre que los datos son correctos.</DialogDescription>

                          {form.getValues('status') === AuctionStatus.CANCELLED && (
                            <Controller
                              name='lastCommunication'
                              control={form.control}
                              render={({ field }) => (
                                <Field className='mt-4'>
                                  <FieldLabel htmlFor={field.name}>Notas de la actualización:</FieldLabel>
                                  <InputGroup>
                                    <InputGroupTextarea {...field} id={field.name} placeholder='Se requiere una correción a razón de...' />
                                  </InputGroup>
                                  <div className='flex flex-wrap gap-1'>
                                    {Object.entries(updateNotesMap).map(([key, note]) => (
                                      <Badge
                                        key={key}
                                        variant='outline'
                                        className='hover:cursor-pointer border-dashed hover:bg-accent'
                                        onClick={() => {
                                          form.setValue('lastCommunication', note)
                                        }}
                                      >
                                        {note}
                                      </Badge>
                                    ))}
                                  </div>
                                  <FieldDescription>
                                    Este mensaje le indicará al usuario próximas acciones que debe realizar o el motivo de la actualización.
                                  </FieldDescription>
                                </Field>
                              )}
                            />
                          )}

                          {form.getValues('status') === AuctionStatus.FINISHED && (
                            <DialogDescription>
                              Al finalizar la subasta, se fijarán los valores de cierre (precio, descuento y rentabilidad) basados en la puja ganadora y se transferirá la propiedad de la factura al inversor ganador: <b>{`${auction.bids[0].investor.companyName} (${auction.bids[0].investor.taxId})`}</b>.
                            </DialogDescription>
                          )}

                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant='outline' onClick={handleReset}>
                                Cancelar
                              </Button>
                            </DialogClose>
                            <Button type='submit' form='debtor-form' onClick={form.handleSubmit(onSubmit)}>
                              Confirmar
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </FieldGroup>
                  </FieldSet>
                </CardContent>
              </form>
            </Form>
          )}
        </Card>

        <AuctionChangeHistory auction={auction} />
      </div>

      <AuctionBidHistory auction={auction} />
    </section>
  )
}

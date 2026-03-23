import { ColorBadge } from '@/components/color-badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
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
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useLocale } from '@/hooks/use-locale'
import { formatCurrency } from '@/lib/format-currency'
import { getAuctionById, updateAuctionById } from '@/services/auction.api'
import { AuctionStatus, type Auction } from '@/types/Auction'
import { zodResolver } from '@hookform/resolvers/zod'
import { BuildingIcon, CheckIcon, CircleCheckIcon, CircleDashedIcon, CircleGaugeIcon, CirclePauseIcon, CircleSlashIcon, CopyIcon, ExternalLinkIcon, GavelIcon, IdCardIcon, SaveIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router'
import z from 'zod'
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
          setLastBreadcrumb(auction.invoice.invoiceId)
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
                  <h3>Detalle de la subasta <span className='text-primary'>{auction.invoice.invoiceId}</span></h3>
                  <ButtonGroup className='xl:ms-auto flex-row-reverse xl:flex-row'>
                    <ButtonGroup>
                      <Button type='button' title='Borrador' disabled variant='outline' className='bg-yellow-300/25 dark:bg-yellow-300/25' onClick={() => form.setValue('status', AuctionStatus.DRAFT)}>
                        <CircleDashedIcon className='w-5 h-5 rounded-full text-yellow-600'/>
                        {form.watch('status') === AuctionStatus.DRAFT && 'Borrador'}
                      </Button>
                      <Button type='button' title='Publicada' variant='outline' className='bg-green-300/25 dark:bg-green-300/25' onClick={() => form.setValue('status', AuctionStatus.PUBLISHED)}>
                        <CircleCheckIcon className='w-5 h-5 rounded-full text-green-600'/>
                        {form.watch('status') === AuctionStatus.PUBLISHED && 'Publicada'}
                      </Button>
                      <Button type='button' title='En curso' disabled variant='outline' className='bg-blue-300/25 dark:bg-blue-300/25' onClick={() => form.setValue('status', AuctionStatus.LIVE)}>
                        <CircleGaugeIcon className='w-5 h-5 rounded-full text-blue-600'/>
                        {form.watch('status') === AuctionStatus.LIVE && 'En curso'}
                      </Button>
                      <Button type='button' title='Pausada' variant='outline' className='bg-slate-300/25 dark:bg-slate-300/25' onClick={() => form.setValue('status', AuctionStatus.PAUSED)}>
                        <CirclePauseIcon className='w-5 h-5 rounded-full text-slate-600'/>
                        {form.watch('status') === AuctionStatus.PAUSED && 'Pausada'}
                      </Button>
                      <Button type='button' title='Cancelada' variant='outline' className='bg-red-300/25 dark:bg-red-300/25' onClick={() => form.setValue('status', AuctionStatus.CANCELLED)}>
                        <CircleSlashIcon className='w-5 h-5 rounded-full text-red-600'/>
                        {form.watch('status') === AuctionStatus.CANCELLED && 'Cancelada'}
                      </Button>
                      <Button type='button' title='Finalizada' disabled variant='outline' className='bg-violet-300/25 dark:bg-violet-300/25' onClick={() => form.setValue('status', AuctionStatus.FINISHED)}>
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
                          value={auction.auctionDate.auctionDateStart}
                          disabled
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Fecha fin</FieldLabel>
                        <DateTimePicker
                          value={auction.auctionDate.auctionDateEnd}
                          disabled
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Precio de salida</FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            value={formatCurrency(auction.startingPrice, locale, auction.invoice.currency) ?? ''}
                            disabled
                          />
                          <InputGroupAddon>
                            €
                          </InputGroupAddon>
                        </InputGroup>
                      </Field>
                      <Field>
                        <FieldLabel>Precio de cierre</FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            value={formatCurrency(auction.endingPrice, locale, auction.invoice.currency) ?? ''}
                            disabled
                          />
                          <InputGroupAddon>
                            €
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
                              <FieldLabel htmlFor='invoiceId'>UID de factura:</FieldLabel>
                              <InputGroup>
                                <InputGroupInput id='invoiceId' value={auction.invoice.invoiceId} type='text' placeholder='A1B2C3D4E5F6G7H8' required disabled />
                                <InputGroupAddon>
                                  #
                                </InputGroupAddon>
                                <InputGroupAddon align='inline-end'>
                                  <button onClick={(e) => copyToClipboard(e, auction.invoice.invoiceId ?? '')} className='group'>
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
                          <DialogDescription>Esta acción actualizará la información del inversor en el sistema, comprueba siempre que los datos son correctos.</DialogDescription>

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

      {(auction && auction.status === AuctionStatus.PAUSED) && (
        <AlertDialog defaultOpen>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Actualización de la subasta</AlertDialogTitle>
              <AlertDialogDescription>
                Compruebe el estado de la subasta y ejecute las acciones necesarias:
                <ul className='list-disc list-inside wrap-break-word'>
                  <li>
                    Seleccione <ColorBadge className='inline' color='green'>publicar</ColorBadge> si está todo correcto para reanudar la subasta (aprox. 1 minuto).
                  </li>
                  <li>
                    Seleccione <ColorBadge className='inline' color='red'>cancelar</ColorBadge> para finalizar la subasta inmediatamente sin adjudicar la factura a ningún inversor (las pujas ejercidas por los inversores serán revertidas).
                  </li>
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Item variant='muted' className='gap-2'>
              <ItemMedia className='self-center! w-10 h-10'>
                <CirclePauseIcon className='w-full h-full rounded-full text-slate-600 bg-slate-300/25 p-2'/>
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Subasta pausada</ItemTitle>
                <ItemDescription className='line-clamp-none'>
                  {auction.lastCommunication}
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

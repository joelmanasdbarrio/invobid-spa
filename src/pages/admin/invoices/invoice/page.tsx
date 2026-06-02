import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Form } from '@/components/ui/form'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupTextarea } from '@/components/ui/input-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useLocale } from '@/hooks/use-locale'
import { copyToClipboard as performCopyToClipboard } from '@/lib/copy-to-clipboard'
import { formatCurrency } from '@/lib/format-currency'
import { getInvoiceById, updateInvoiceById } from '@/services/invoice.api'
import { type Invoice, InvoiceStatus } from '@/types/Invoice'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  BuildingIcon,
  CheckCheckIcon,
  CheckIcon,
  CircleAlertIcon,
  ClockIcon,
  CopyIcon,
  ExternalLinkIcon,
  FileTextIcon,
  IdCardIcon,
  LockIcon,
  LockOpenIcon,
  OctagonXIcon,
  RotateCcwIcon,
  SaveIcon
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router'
import z from 'zod'
import { InvoiceChangeHistory } from './components/invoice-change-history'
import InvoiceDocuments from './components/invoice-documents/invoice-documents'

const formSchema = z.object({
  status: z.enum(InvoiceStatus).optional(),
  rating: z.coerce.number<number>().optional(),
  lastCommunication: z.string().optional()
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

const UPDATE_NOTES_MAP: Record<string, string> = {
  correctVerification: 'Factura verificada correctamente',
  updatedCompanyName: 'Se ha actualizado el rating de la factura',
  incorrectDocument: 'El documento es incorrecto o no es legible'
}

export default function AdminInvoicePage ({setLastBreadcrumb}: { setLastBreadcrumb: (breadcrumb: string) => void }) {
  const {svc} = useParams()
  const [invoiceState, setInvoiceState] = useState<{ invoice: Invoice | undefined; originalInvoice: Invoice | undefined }>({ invoice: undefined, originalInvoice: undefined })
  const invoice = invoiceState.invoice
  const originalInvoice = invoiceState.originalInvoice
  const setInvoice = (i: Invoice | undefined) => setInvoiceState(prev => ({ ...prev, invoice: i }))
  const [isFormDisabled, setIsFormDisabled] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { locale } = useLocale()

  const navigate = useNavigate()
  useEffect(() => {
    if(svc) {
      getInvoiceById(svc)
        .then(res => res.data)
        .then(invoice => {
          setInvoiceState({ invoice, originalInvoice: invoice })
          setLastBreadcrumb(`Factura ${invoice.svc}`)
        })
        .catch(() => {
          navigate('/admin/invoices')
        })
    }
  }, [svc, navigate, setLastBreadcrumb])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: {
      status: invoice?.status ?? undefined,
      rating: invoice?.rating ?? undefined,
      lastCommunication: invoice?.lastCommunication ?? ''
    }
  })

  const watchedStatus = useWatch({ control: form.control, name: 'status' })

  useEffect(() => {
    form.reset({
      status: invoice?.status ?? undefined,
      rating: invoice?.rating ?? undefined,
      lastCommunication: invoice?.lastCommunication ?? ''
    })
  }, [invoice, form])

  function onSubmit (data: z.infer<typeof formSchema>) {
    if (!invoice) return

    const updateData = {
      ...invoice,
      status: data.status ?? invoice.status,
      rating: data.rating,
      ...(data.lastCommunication && { lastCommunication: data.lastCommunication })
    }

    updateInvoiceById(invoice.id, JSON.stringify(updateData))
      .then(res => res.data)
      .then(updatedInvoice => {
        setInvoiceState({ invoice: updatedInvoice, originalInvoice: updatedInvoice })
        form.reset({
          status: updatedInvoice.status ?? undefined,
          rating: updatedInvoice.rating ?? undefined,
          lastCommunication: updatedInvoice.lastCommunication ?? ''})
        setIsFormDisabled(true)
        setIsDialogOpen(false)
      })
      .then(() => navigate(`/admin/invoices/${svc}`))
  }

  function handleReset () {
    form.reset()
    setInvoice(originalInvoice)
  }

  return (
    <section className='flex flex-col gap-4'>
      <div className='flex items-center gap-2'>
        <span className='rounded-lg p-1 bg-primary/20 text-primary'>
          <FileTextIcon className='size-6' />
        </span>
        <h2>Gestionar factura</h2>
      </div>
      <div className='grid xl:grid-cols-3 gap-4'>
        <Card className='xl:col-span-2'>
          <Form {...form}>
            <form id='invoice-form' onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4'>
              <CardHeader className='flex flex-col xl:flex-row gap-2'>
                <h3>Detalle de la factura <span className='text-primary'>{invoice?.id}</span></h3>
                <ButtonGroup className='xl:ms-auto flex-row-reverse xl:flex-row'>
                  <ButtonGroup>
                    {isFormDisabled
                      ? (
                        <Button type='button' variant='outline' onClick={() => setIsFormDisabled(false)}>
                          <LockIcon />
                        </Button>
                      ) : (
                        <Button type='button' variant='outline' onClick={() => setIsFormDisabled(true)}>
                          <LockOpenIcon />
                        </Button>
                      )}
                  </ButtonGroup>

                  <ButtonGroup>
                    <Button type='button' variant='outline' className='bg-zinc-300/25 dark:bg-zinc-300/25' onClick={() => form.setValue('status', InvoiceStatus.DENIED, { shouldDirty: true })}>
                      <OctagonXIcon className='rounded-full text-zinc-600'/>
                      {watchedStatus === InvoiceStatus.DENIED && 'Denegado'}
                    </Button>
                    <Button type='button' variant='outline' className='bg-red-300/25 dark:bg-red-300/25' onClick={() => form.setValue('status', InvoiceStatus.CORRECTION, { shouldDirty: true })}>
                      <CircleAlertIcon className='size-5 rounded-full text-red-600'/>
                      {watchedStatus === InvoiceStatus.CORRECTION && 'Corrección'}
                    </Button>
                    <Button type='button' variant='outline' className='bg-yellow-300/25 dark:bg-yellow-300/25' onClick={() => form.setValue('status', InvoiceStatus.PENDING, { shouldDirty: true })}>
                      <ClockIcon className='size-5 rounded-full text-yellow-600'/>
                      {watchedStatus === InvoiceStatus.PENDING && 'Por verificar'}
                    </Button>
                    <Button type='button' variant='outline' className='bg-green-300/25 dark:bg-green-300/25' onClick={() => form.setValue('status', InvoiceStatus.VERIFIED, { shouldDirty: true })}>
                      <CheckCheckIcon className='size-5 rounded-full text-green-600'/>
                      {watchedStatus === InvoiceStatus.VERIFIED && 'Verificado'}
                    </Button>
                  </ButtonGroup>
                </ButtonGroup>
              </CardHeader>

              <CardContent className='flex flex-col gap-4'>
                <FieldSet className='**:data-[slot=field-group]:grid lg:**:data-[slot=field-group]:grid-cols-2'>
                  <FieldGroup>
                    <Controller
                      name='rating'
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor={field.name}>Rating:</FieldLabel>
                          <InputGroup>
                            <InputGroupInput {...field} aria-invalid={fieldState.invalid} id={field.name} type='text' placeholder='0' required disabled={isFormDisabled} />
                            <InputGroupAddon>
                              %
                            </InputGroupAddon>
                            <InputGroupAddon align='inline-end'>
                              <button type='button' onClick={(e) => copyToClipboard(e, invoice?.rating ?? 0)} className='group'>
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
                          </InputGroup>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                    <Field>
                      <FieldLabel htmlFor='svc'>UID de factura:</FieldLabel>
                      <InputGroup>
                        <InputGroupInput id='svc' value={invoice?.svc ?? ''} type='text' placeholder='0' required disabled />
                        <InputGroupAddon>
                          #
                        </InputGroupAddon>
                        <InputGroupAddon align='inline-end'>
                          <button type='button' onClick={(e) => copyToClipboard(e, invoice?.svc ?? '')} className='group'>
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
                      </InputGroup>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor='dueDate'>Fecha de vencimiento:</FieldLabel>
                      <DatePicker id='dueDate' value={invoice?.dueDate ?? ''} disabled />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor='amount'>Importe:</FieldLabel>
                      <InputGroup>
                        <InputGroupInput id='amount' value={formatCurrency(invoice?.amount ?? 0, locale, invoice?.currency)} type='text' placeholder='0' required disabled />
                        <InputGroupAddon>
                          €
                        </InputGroupAddon>
                        <InputGroupAddon align='inline-end'>
                          <button type='button' onClick={(e) => copyToClipboard(e, invoice?.amount ?? '')} className='group'>
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
                      </InputGroup>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor='buyerPercentage'>Comisión del inversor:</FieldLabel>
                      <InputGroup>
                        <InputGroupInput id='buyerPercentage' value={invoice?.transactionFee?.buyerPercentage ?? ''} type='number' placeholder='0' required disabled />
                        <InputGroupAddon>
                          %
                        </InputGroupAddon>
                        <InputGroupAddon align='inline-end'>
                          <button type='button' onClick={(e) => copyToClipboard(e, invoice?.transactionFee?.buyerPercentage ?? 0)} className='group'>
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
                      </InputGroup>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor='sellerPercentage'>Comisión del cedente:</FieldLabel>
                      <InputGroup>
                        <InputGroupInput id='sellerPercentage' value={invoice?.transactionFee?.sellerPercentage ?? ''} type='number' placeholder='0' required disabled />
                        <InputGroupAddon>
                          %
                        </InputGroupAddon>
                        <InputGroupAddon align='inline-end'>
                          <button type='button' onClick={(e) => copyToClipboard(e, invoice?.transactionFee?.sellerPercentage ?? 0)} className='group'>
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
                      </InputGroup>
                    </Field>
                  </FieldGroup>
                </FieldSet>
                <Accordion type='multiple'>
                  <FieldSet className='**:data-[slot=field-group]:grid lg:**:data-[slot=field-group]:grid-cols-2'>
                    <AccordionItem value='seller'>
                      <AccordionTrigger>
                        <div>
                          <FieldLegend>Información del cedente</FieldLegend>
                          <FieldDescription>Cedente que vende la factura</FieldDescription>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <FieldGroup>
                          <Field>
                            <FieldLabel htmlFor='investorTaxId'>CIF/NIF:</FieldLabel>
                            <InputGroup>
                              <InputGroupInput id='investorTaxId' value={invoice?.sellerInvestor?.taxId ?? ''} type='text' placeholder='12345678A' required disabled />
                              <InputGroupAddon>
                                <IdCardIcon />
                              </InputGroupAddon>
                              <InputGroupAddon align='inline-end'>
                                <button type='button' onClick={(e) => copyToClipboard(e, invoice?.sellerInvestor?.taxId ?? '')} className='group'>
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
                            </InputGroup>
                          </Field>
                          <Field>
                            <FieldLabel htmlFor='investorCompanyName'>Razón social:</FieldLabel>
                            <InputGroup>
                              <InputGroupInput id='investorCompanyName' value={invoice?.sellerInvestor?.companyName ?? ''} type='text' placeholder='ACME S.L.' required disabled />
                              <InputGroupAddon>
                                <BuildingIcon />
                              </InputGroupAddon>
                              <InputGroupAddon align='inline-end'>
                                <button type='button' onClick={(e) => copyToClipboard(e, invoice?.sellerInvestor?.companyName ?? '')} className='group'>
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
                            </InputGroup>
                          </Field>
                          <FieldDescription>
                            <Link to={`/admin/users/${invoice?.sellerInvestor?.id}`} className='text-xs'>
                              Consultar cedente
                              <ExternalLinkIcon className='size-3 inline-block ml-1' />
                            </Link>
                          </FieldDescription>
                        </FieldGroup>
                      </AccordionContent>
                    </AccordionItem>
                  </FieldSet>
                  <FieldSet className='**:data-[slot=field-group]:grid lg:**:data-[slot=field-group]:grid-cols-2'>
                    <AccordionItem value='debtor'>
                      <AccordionTrigger>
                        <div>
                          <FieldLegend>Información del deudor</FieldLegend>
                          <FieldDescription>Deudor asociado a la factura</FieldDescription>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <FieldGroup>
                          <Field>
                            <FieldLabel htmlFor='debtorTaxId'>CIF/NIF:</FieldLabel>
                            <InputGroup>
                              <InputGroupInput id='debtorTaxId' value={invoice?.debtor?.taxId ?? ''} type='text' placeholder='12345678A' required disabled />
                              <InputGroupAddon>
                                <IdCardIcon />
                              </InputGroupAddon>
                              <InputGroupAddon align='inline-end'>
                                <button type='button' onClick={(e) => copyToClipboard(e, invoice?.debtor?.taxId ?? '')} className='group'>
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
                            </InputGroup>
                          </Field>
                          <Field>
                            <FieldLabel htmlFor='debtorCompanyName'>Razón social:</FieldLabel>
                            <InputGroup>
                              <InputGroupInput id='debtorCompanyName' value={invoice?.debtor?.companyName ?? ''} type='text' placeholder='ACME S.L.' required disabled />
                              <InputGroupAddon>
                                <BuildingIcon />
                              </InputGroupAddon>
                              <InputGroupAddon align='inline-end'>
                                <button type='button' onClick={(e) => copyToClipboard(e, invoice?.debtor?.companyName ?? '')} className='group'>
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
                            </InputGroup>
                          </Field>
                          <FieldDescription>
                            <Link to={`/admin/debtors/${invoice?.debtor?.id}`} className='text-xs'>
                              Consultar deudor
                              <ExternalLinkIcon className='size-3 inline-block ml-1' />
                            </Link>
                          </FieldDescription>
                        </FieldGroup>
                      </AccordionContent>
                    </AccordionItem>
                  </FieldSet>
                  {invoice?.buyerInvestor && (
                    <FieldSet className='**:data-[slot=field-group]:grid lg:**:data-[slot=field-group]:grid-cols-2'>
                      <AccordionItem value='investor'>
                        <AccordionTrigger>
                          <div>
                            <FieldLegend>Información del inversor</FieldLegend>
                            <FieldDescription>Inversor que adquirió la factura</FieldDescription>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <FieldGroup>
                            <Field>
                              <FieldLabel htmlFor='investorTaxId'>CIF/NIF del inversor:</FieldLabel>
                              <InputGroup>
                                <InputGroupInput id='investorTaxId' value={invoice?.buyerInvestor?.taxId ?? ''} type='text' placeholder='12345678A' required disabled />
                                <InputGroupAddon>
                                  <IdCardIcon />
                                </InputGroupAddon>
                                <InputGroupAddon align='inline-end'>
                                  <button type='button' onClick={(e) => copyToClipboard(e, invoice?.buyerInvestor?.taxId ?? '')} className='group'>
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
                              </InputGroup>
                            </Field>
                            <Field>
                              <FieldLabel htmlFor='investorCompanyName'>Razón social del inversor:</FieldLabel>
                              <InputGroup>
                                <InputGroupInput id='investorCompanyName' value={invoice?.buyerInvestor?.companyName ?? ''} type='text' placeholder='ACME S.L.' required disabled />
                                <InputGroupAddon>
                                  <BuildingIcon />
                                </InputGroupAddon>
                                <InputGroupAddon align='inline-end'>
                                  <button type='button' onClick={(e) => copyToClipboard(e, invoice?.buyerInvestor?.companyName ?? '')} className='group'>
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
                              </InputGroup>
                            </Field>
                            <FieldDescription>
                              <Link to={`/admin/users/${invoice?.buyerInvestor?.id}`} className='text-xs'>
                                Consultar inversor
                                <ExternalLinkIcon className='size-3 inline-block ml-1' />
                              </Link>
                            </FieldDescription>
                          </FieldGroup>
                        </AccordionContent>
                      </AccordionItem>
                    </FieldSet>
                  )}
                </Accordion>
                <FieldSet>
                  <FieldGroup className='flex flex-row gap-2 items-center justify-end'>
                    <Button type='button' variant='secondary' onClick={handleReset} disabled={JSON.stringify(originalInvoice) === JSON.stringify(invoice) && !form.formState.isDirty}>
                      <RotateCcwIcon />
                      Deshacer
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button disabled={JSON.stringify(originalInvoice) === JSON.stringify(invoice) && !form.formState.isDirty}>
                          <SaveIcon />
                          Guardar cambios
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>¿Estás seguro de que deseas guardar los cambios?</DialogTitle>
                        </DialogHeader>
                        <DialogDescription>Esta acción actualizará la información de la factura en el sistema, comprueba siempre que los datos son correctos.</DialogDescription>

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
                                {Object.entries(UPDATE_NOTES_MAP).map(([key, note]) => (
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
                          <Button type='submit' form='invoice-form' onClick={form.handleSubmit(onSubmit)}>
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
        </Card>

        <InvoiceChangeHistory invoice={invoice} />
      </div>

      <InvoiceDocuments invoiceSvc={invoice?.svc ?? ''} />
    </section>
  )
}

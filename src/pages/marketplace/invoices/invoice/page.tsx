import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useLocale } from '@/hooks/use-locale'
import { copyToClipboard as performCopyToClipboard } from '@/lib/copy-to-clipboard'
import { formatCurrency } from '@/lib/format-currency'
import { getInvoiceById } from '@/services/invoice.api'
import type { Invoice } from '@/types/Invoice'
import {
  BuildingIcon,
  CheckIcon,
  CopyIcon,
  FileTextIcon,
  IdCardIcon,
  MailIcon,
  PhoneIcon
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { DocumentPreview } from '../../../../components/document-preview'
import { ProgressBar } from '../../auctions/components/progress-bar'

export default function MarketplaceInvoicePage ({ setLastBreadcrumb }: { setLastBreadcrumb: (breadcrumb: string) => void }) {
  const { invoiceId } = useParams()
  const [invoice, setInvoice] = useState<Invoice | undefined>()
  const { locale } = useLocale()

  const navigate = useNavigate()

  useEffect(() => {
    if (invoiceId) {
      getInvoiceById(invoiceId)
        .then(res => res.data)
        .then(invoice => {
          setInvoice(invoice)
          setLastBreadcrumb(`Factura ${invoice.svc}`)
        })
        .catch(() => {
          navigate('/marketplace/invoices')
        })
    }
  }, [invoiceId, navigate, setLastBreadcrumb])

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

  return (
    <section className='flex flex-col gap-4'>
      <div className='flex items-center gap-2'>
        <span className='rounded-lg p-1 bg-primary/20 text-primary'>
          <FileTextIcon className='w-6 h-6' />
        </span>
        <h2>Detalle de factura</h2>
      </div>
      <div className='grid xl:grid-cols-3 gap-4 items-start'>
        <div className='xl:col-span-2 flex flex-col gap-4'>
          <Card>
            <CardHeader className='flex flex-col xl:flex-row gap-2'>
              <h3>Detalle de la factura <span className='text-primary'>{invoice?.id}</span></h3>
            </CardHeader>

            <CardContent className='flex flex-col gap-4'>
              <FieldSet className='**:data-[slot=field-group]:grid lg:**:data-[slot=field-group]:grid-cols-2'>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor='rating'>Rating:</FieldLabel>
                    <InputGroup>
                      <InputGroupInput id='rating' value={invoice?.rating ?? ''} type='text' placeholder='0' disabled />
                      <InputGroupAddon>
                        %
                      </InputGroupAddon>
                      <InputGroupAddon align='inline-end'>
                        <button onClick={(e) => copyToClipboard(e, invoice?.rating ?? 0)} className='group'>
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
                    <FieldLabel htmlFor='svc'>UID de factura:</FieldLabel>
                    <InputGroup>
                      <InputGroupInput id='svc' value={invoice?.svc ?? ''} type='text' placeholder='0' required disabled />
                      <InputGroupAddon>
                        #
                      </InputGroupAddon>
                      <InputGroupAddon align='inline-end'>
                        <button onClick={(e) => copyToClipboard(e, invoice?.svc ?? '')} className='group'>
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
                        <button onClick={(e) => copyToClipboard(e, invoice?.amount ?? '')} className='group'>
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
                    <FieldLabel htmlFor='buyerPercentage'>Comisión del inversor:</FieldLabel>
                    <InputGroup>
                      <InputGroupInput id='buyerPercentage' value={invoice?.transactionFee?.buyerPercentage ?? ''} type='number' placeholder='0' required disabled />
                      <InputGroupAddon>
                        %
                      </InputGroupAddon>
                      <InputGroupAddon align='inline-end'>
                        <button onClick={(e) => copyToClipboard(e, invoice?.transactionFee?.buyerPercentage ?? 0)} className='group'>
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
                    <FieldLabel htmlFor='sellerPercentage'>Comisión del cedente:</FieldLabel>
                    <InputGroup>
                      <InputGroupInput id='sellerPercentage' value={invoice?.transactionFee?.sellerPercentage ?? ''} type='number' placeholder='0' required disabled />
                      <InputGroupAddon>
                        %
                      </InputGroupAddon>
                      <InputGroupAddon align='inline-end'>
                        <button onClick={(e) => copyToClipboard(e, invoice?.transactionFee?.sellerPercentage ?? 0)} className='group'>
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
                </FieldGroup>
              </FieldSet>
              <Accordion type='multiple'>
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
                              <button onClick={(e) => copyToClipboard(e, invoice?.debtor?.taxId ?? '')} className='group'>
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
                            <InputGroupInput id='debtorCompanyName' value={invoice?.debtor?.companyName ?? ''} type='text' placeholder='ACME S.L.' required disabled />
                            <InputGroupAddon>
                              <BuildingIcon />
                            </InputGroupAddon>
                            <InputGroupAddon align='inline-end'>
                              <button onClick={(e) => copyToClipboard(e, invoice?.debtor?.companyName ?? '')} className='group'>
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
                          <FieldLabel htmlFor='debtorEmail'>Email:</FieldLabel>
                          <InputGroup>
                            <InputGroupInput id='debtorEmail' value={invoice?.debtor?.email ?? ''} type='text' placeholder='empresa@ejemplo.com' disabled />
                            <InputGroupAddon>
                              <MailIcon />
                            </InputGroupAddon>
                            <InputGroupAddon align='inline-end'>
                              <button onClick={(e) => copyToClipboard(e, invoice?.debtor?.email ?? '')} className='group'>
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
                          <FieldLabel htmlFor='debtorPhoneNumber'>Teléfono:</FieldLabel>
                          <InputGroup>
                            <InputGroupInput id='debtorPhoneNumber' value={invoice?.debtor?.phoneNumber ?? ''} type='text' placeholder='+34 600 000 000' disabled />
                            <InputGroupAddon>
                              <PhoneIcon />
                            </InputGroupAddon>
                            <InputGroupAddon align='inline-end'>
                              <button onClick={(e) => copyToClipboard(e, invoice?.debtor?.phoneNumber ?? '')} className='group'>
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
                      </FieldGroup>
                    </AccordionContent>
                  </AccordionItem>
                </FieldSet>
              </Accordion>
            </CardContent>
          </Card>
          {invoice && (
            <div className='px-6'>
              <ProgressBar
                dateStart={invoice.updatedAt}
                dateEnd={invoice.dueDate}
              />
            </div>
          )}
        </div>

        {invoice?.documents[0] && <DocumentPreview document={invoice.documents[0]} />}
      </div>
    </section>
  )
}

import { useLocale } from '@/hooks/use-locale'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router'
import z from 'zod'

import { getAuctionById } from '@/services/auction.api'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Form } from '@/components/ui/form'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { formatCurrency } from '@/lib/format-currency'
import { AuctionStatus, type Auction } from '@/types/Auction'
import { BuildingIcon, GavelIcon, IdCardIcon } from 'lucide-react'
import { ProgressBar } from '../components/progress-bar'
import { MarketplaceAuctionBids } from './components/auction-bids/auction-bids'

const formSchema = z.object({
  status: z.enum(AuctionStatus).optional(),
  lastCommunication: z.string().optional()
})

export default function MarketplaceAuctionPage ({ setLastBreadcrumb }: { setLastBreadcrumb: (breadcrumb: string) => void }) {
  const {auctionId} = useParams()
  const [auction, setAuction] = useState<Auction | undefined>()
  const { locale } = useLocale()

  const navigate = useNavigate()
  useEffect(() => {
    if (auctionId) {
      getAuctionById(auctionId)
        .then(res => res.data)
        .then(auction => {
          setAuction(auction)
          setLastBreadcrumb(`Subasta de factura ${auction.invoice.svc}`)
        })
        .catch(() => {
          navigate('/marketplace/auctions')
        })
    }
  }, [auctionId, navigate, setLastBreadcrumb])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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

  return (
    <section className='flex flex-col gap-4'>
      <div className='flex items-center gap-2'>
        <span className='rounded-lg p-1 bg-primary/20 text-primary'>
          <GavelIcon className='size-6' />
        </span>
        <h2>Consultar subasta</h2>
      </div>

      <MarketplaceAuctionBids
        auction={auction}
        onAuctionExtended={(newEndDate) =>
          setAuction(prev => prev ? { ...prev, date: { ...prev.date, end: newEndDate } } : prev)
        }
      />

      {auction && auction.date.start && auction.date.end && (
        <div className='px-6'>
          <ProgressBar
            dateStart={auction.date.start}
            dateEnd={auction.date.end}
          />
        </div>
      )}

      <Card>
        {auction && (
          <Form {...form}>
            <form id='auction-form' className='flex flex-col gap-4'>
              <CardHeader className='flex flex-row items-center gap-2'>
                <h3>Detalles de la subasta <span className='text-primary'>{auction.invoice.svc}</span></h3>
              </CardHeader>

              <CardContent className='flex flex-col gap-4'>
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

                        <FieldGroup className='flex flex-col gap-4 lg:grid lg:grid-cols-2'>
                          <Field>
                            <FieldLabel htmlFor='investorTaxId'>CIF/NIF:</FieldLabel>
                            <InputGroup>
                              <InputGroupInput id='investorTaxId' value={auction.invoice.sellerInvestor.taxId} type='text' placeholder='12345678A' required disabled />
                              <InputGroupAddon>
                                <IdCardIcon />
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
                            </InputGroup>
                          </Field>
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
                        <FieldGroup className='flex flex-col gap-4 lg:grid lg:grid-cols-2'>
                          <Field>
                            <FieldLabel htmlFor='debtorTaxId'>CIF/NIF:</FieldLabel>
                            <InputGroup>
                              <InputGroupInput id='debtorTaxId' value={auction.invoice.debtor.taxId} type='text' placeholder='12345678A' required disabled />
                              <InputGroupAddon>
                                <IdCardIcon />
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
                            </InputGroup>
                          </Field>
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
                        <FieldGroup className='flex flex-col gap-4 lg:grid lg:grid-cols-2'>
                          <Field>
                            <FieldLabel htmlFor='svc'>UID de factura:</FieldLabel>
                            <InputGroup>
                              <InputGroupInput id='svc' value={auction.invoice.svc} type='text' placeholder='A1B2C3D4E5F6G7H8' required disabled />
                              <InputGroupAddon>
                                #
                              </InputGroupAddon>
                            </InputGroup>
                          </Field>
                          <Field>
                            <FieldLabel htmlFor='invoiceAmount'>Importe:</FieldLabel>
                            <InputGroup>
                              <InputGroupInput id='invoiceAmount' value={formatCurrency(auction.invoice?.amount ?? 0, locale, auction.invoice?.currency)} type='text' placeholder='0' required disabled />
                              <InputGroupAddon>
                                €
                              </InputGroupAddon>
                            </InputGroup>
                          </Field>
                          <Field>
                            <FieldLabel htmlFor='invoiceRating'>Rating {import.meta.env.VITE_APP_NAME}:</FieldLabel>
                            <InputGroup>
                              <InputGroupInput id='invoiceRating' value={auction.invoice?.rating ?? ''} type='text' required disabled />
                              <InputGroupAddon>
                                %
                              </InputGroupAddon>
                            </InputGroup>
                          </Field>
                          <Field>
                            <FieldLabel htmlFor='invoiceExtRating'>Rating {import.meta.env.VITE_EXT_RATING_PROVIDER}:</FieldLabel>
                            <InputGroup>
                              <InputGroupInput id='invoiceExtRating' value={auction.invoice?.extRating ?? ''} type='text' required disabled />
                              <InputGroupAddon>
                                %
                              </InputGroupAddon>
                            </InputGroup>
                          </Field>
                          <Field>
                            <FieldLabel htmlFor='invoiceDueDate'>Fecha de vencimiento:</FieldLabel>
                            <DatePicker id='invoiceDueDate' value={auction.invoice?.dueDate ?? ''} disabled />
                          </Field>
                        </FieldGroup>
                      </AccordionContent>
                    </AccordionItem>
                  </FieldSet>
                </Accordion>
              </CardContent>
            </form>
          </Form>
        )}
      </Card>

    </section>
  )
}

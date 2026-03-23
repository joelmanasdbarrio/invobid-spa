import { useLocale } from '@/hooks/use-locale'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router'
import z from 'zod'

import { getAuctionById } from '@/services/auction.api'

import { ColorBadge } from '@/components/color-badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Form } from '@/components/ui/form'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { formatCurrency } from '@/lib/format-currency'
import { AuctionStatus, type Auction } from '@/types/Auction'
import { BuildingIcon, CirclePauseIcon, FileTextIcon, GavelIcon, IdCardIcon, ShieldCheckIcon } from 'lucide-react'
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
          setLastBreadcrumb(auction.invoice.invoiceId)
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
          <GavelIcon className='w-6 h-6' />
        </span>
        <h2>Consultar subasta</h2>
      </div>

      <MarketplaceAuctionBids auction={auction} />

      {auction && (
        <div className='px-6'>
          <ProgressBar
            dateStart={auction?.auctionDate.auctionDateStart ?? ''}
            dateEnd={auction?.auctionDate.auctionDateEnd ?? ''}
            pausedAt={auction?.pausedAt ?? undefined}
          />
        </div>
      )}

      <Card>
        {auction && (
          <Form {...form}>
            <form id='auction-form' className='flex flex-col gap-4'>
              <CardHeader className='flex flex-row items-center gap-2'>
                <h3>Detalles de la subasta <span className='text-primary'>{auction.invoice.invoiceId}</span></h3>
                <ColorBadge
                  color={auction.invoice.rating! >= 4.9 ? 'green' : auction.invoice.rating! >= 4.5 ? 'yellow' : 'red'}
                  icon={<ShieldCheckIcon />}
                  className='px-1'
                >
                  <span title={`Rating ${auction.invoice.rating}`}>
                    {auction.invoice.rating}
                  </span>
                </ColorBadge>
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
                            <FieldLabel htmlFor='invoiceId'>UID de factura:</FieldLabel>
                            <InputGroup>
                              <InputGroupInput id='invoiceId' value={auction.invoice.invoiceId} type='text' placeholder='A1B2C3D4E5F6G7H8' required disabled />
                              <InputGroupAddon>
                                #
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
                            </InputGroup>
                          </Field>
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
                          <FieldGroup className='flex flex-col gap-4 lg:grid lg:grid-cols-2'>
                            <Field>
                              <FieldLabel htmlFor='investorTaxId'>CIF/NIF:</FieldLabel>
                              <InputGroup>
                                <InputGroupInput id='investorTaxId' value={auction.invoice.buyerInvestor?.taxId} type='text' placeholder='12345678A' required disabled />
                                <InputGroupAddon>
                                  <IdCardIcon />
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
                              </InputGroup>
                            </Field>
                          </FieldGroup>
                        </AccordionContent>
                      </AccordionItem>
                    </FieldSet>
                  )}
                </Accordion>
              </CardContent>
            </form>
          </Form>
        )}
      </Card>

      {(auction && auction.status === AuctionStatus.PAUSED) && (
        <AlertDialog defaultOpen>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className='flex flex-col items-center'>
                <CirclePauseIcon className='size-12 rounded-full text-slate-600 bg-slate-300/25 p-2'/>
                La subasta se ha pausado para revisión
              </AlertDialogTitle>

              <AlertDialogDescription>
                La subasta <span className='font-bold'><FileTextIcon className='size-4 inline-block mb-1' /> {auction.invoice.invoiceId}</span> ha sido pausada por el equipo de Invobid para su revisión. Si tienes alguna duda, por favor contacta con soporte.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction>Aceptar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </section>
  )
}

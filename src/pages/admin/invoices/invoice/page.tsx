import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Form } from '@/components/ui/form'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupTextarea } from '@/components/ui/input-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { getInvoiceById, updateInvoiceById } from '@/services/invoice.api'
import { InvoiceStatus, type Invoice } from '@/types/Invoice'
import { zodResolver } from '@hookform/resolvers/zod'
import { BuildingIcon, CheckCheckIcon, CheckIcon, CircleAlertIcon, ClockIcon, CopyIcon, IdCardIcon, LockIcon, LockOpenIcon, OctagonXIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router'
import z from 'zod'
import { InvoiceChangeHistory } from './invoice-change-history'
import InvoiceDocuments from './invoice-documents/invoice-documents'

const formSchema = z.object({
  rating: z.coerce.number().optional(),
  lastCommunication: z.string().optional()
})

export default function AdminInvoicePage () {
  const {invoiceId} = useParams()
  const [invoice, setInvoice] = useState<Invoice | undefined>()
  const [originalInvoice, setOriginalInvoice] = useState<Invoice | undefined>(invoice)
  const [isFormDisabled, setIsFormDisabled] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const navigate = useNavigate()
  useEffect(() => {
    if(invoiceId) {
      getInvoiceById(invoiceId)
        .then(res => res.data)
        .then(invoice => {
          setInvoice(invoice)
          setOriginalInvoice(invoice)
        })
        .catch(() => {
          navigate('/admin/invoices')
        })
    }
  }, [invoiceId, navigate])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: {
      rating: invoice?.rating ?? 0,
      lastCommunication: invoice?.lastCommunication ?? ''
    }
  })

  useEffect(() => {
    form.reset({
      rating: invoice?.rating ?? 0,
      lastCommunication: invoice?.lastCommunication ?? ''
    })
  }, [invoice, form])

  function onSubmit (data: z.infer<typeof formSchema>) {
    if (!invoice) return

    const updateData = {
      ...invoice,
      status: invoice.status,
      rating: data.rating,
      ...(data.lastCommunication && { lastCommunication: data.lastCommunication })
    }

    updateInvoiceById(invoice.id, JSON.stringify(updateData))
      .then(res => res.data)
      .then(updatedInvoice => {
        setInvoice(updatedInvoice)
        setOriginalInvoice(updatedInvoice)
        form.reset({
          rating: updatedInvoice.rating ?? 0,
          lastCommunication: updatedInvoice.lastCommunication ?? ''})
        setIsFormDisabled(true)
        setIsDialogOpen(false)
      })
  }

  function handleReset () {
    form.reset()
    setInvoice(originalInvoice)
  }

  function copyToClipboard (e: React.MouseEvent<HTMLButtonElement>, text: string | number) {
    e.preventDefault()
    navigator.clipboard.writeText(text.toString())
    const button = e.currentTarget
    button.setAttribute('data-copied', 'true')
    setTimeout(() => {
      button.removeAttribute('data-copied')
    }, 2000)
  }

  const updateNotesMap: Record<string, string> = {
    correctVerification: 'Factura verificada correctamente',
    updatedCompanyName: 'Se ha actualizado el rating de la factura',
    incorrectDocument: 'El documento es incorrecto o no es legible'
  }

  return (
    <section className='flex flex-col gap-4'>
      <div className='grid xl:grid-cols-3 gap-4'>
        <Form {...form}>
          <form id='debtor-form' onSubmit={form.handleSubmit(onSubmit)} className='xl:col-span-2 flex flex-col gap-4'>
            <div className='flex flex-col xl:flex-row gap-2'>
              <h3 className='text-lg'>Detalles de la factura</h3>
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
                  <Button type='button' variant='outline' className='bg-zinc-300/25 dark:bg-zinc-300/25' onClick={() => invoice && setInvoice({...invoice, status: InvoiceStatus.DENIED})}>
                    <OctagonXIcon className='rounded-full text-zinc-600'/>
                    {invoice?.status === InvoiceStatus.DENIED && 'Denegado'}
                  </Button>
                  <Button type='button' variant='outline' className='bg-red-300/25 dark:bg-red-300/25' onClick={() => invoice && setInvoice({...invoice, status: InvoiceStatus.CORRECTION})}>
                    <CircleAlertIcon className='w-5 h-5 rounded-full text-red-600'/>
                    {invoice?.status === InvoiceStatus.CORRECTION && 'Corrección requerida'}
                  </Button>
                  <Button type='button' variant='outline' className='bg-yellow-300/25 dark:bg-yellow-300/25' onClick={() => invoice && setInvoice({...invoice, status: InvoiceStatus.PENDING})}>
                    <ClockIcon className='w-5 h-5 rounded-full text-yellow-600'/>
                    {invoice?.status === InvoiceStatus.PENDING && 'Por verificar'}
                  </Button>
                  <Button type='button' variant='outline' className='bg-green-300/25 dark:bg-green-300/25' onClick={() => invoice && setInvoice({...invoice, status: InvoiceStatus.VERIFIED})}>
                    <CheckCheckIcon className='w-5 h-5 rounded-full text-green-600'/>
                    {invoice?.status === InvoiceStatus.VERIFIED && 'Verificado'}
                  </Button>
                </ButtonGroup>
              </ButtonGroup>
            </div>

            <FieldGroup className='flex flex-col gap-4 xl:grid xl:grid-cols-2'>
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
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Field>
                <FieldLabel htmlFor='amount'>Importe:</FieldLabel>
                <InputGroup>
                  <InputGroupInput id='amount' value={invoice?.amount} type='text' placeholder='0' required disabled />
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
                <FieldLabel htmlFor='buyerPercentage'>Comisión del comprador:</FieldLabel>
                <InputGroup>
                  <InputGroupInput id='buyerPercentage' value={invoice?.transactionFee?.buyerPercentage} type='number' placeholder='0' required disabled />
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
                <FieldLabel htmlFor='sellerPercentage'>Comisión del vendedor:</FieldLabel>
                <InputGroup>
                  <InputGroupInput id='sellerPercentage' value={invoice?.transactionFee?.sellerPercentage} type='number' placeholder='0' required disabled />
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
              <Field>
                <FieldLabel htmlFor='investorTaxId'>CIF/NIF del inversor:</FieldLabel>
                <InputGroup>
                  <InputGroupInput id='investorTaxId' value={invoice?.sellerInvestor?.taxId} type='text' placeholder='12345678A' required disabled />
                  <InputGroupAddon>
                    <IdCardIcon />
                  </InputGroupAddon>
                  <InputGroupAddon align='inline-end'>
                    <button onClick={(e) => copyToClipboard(e, invoice?.sellerInvestor?.taxId ?? '')} className='group'>
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
                <FieldLabel htmlFor='investorCompanyName'>Razón social del inversor:</FieldLabel>
                <InputGroup>
                  <InputGroupInput id='investorCompanyName' value={invoice?.sellerInvestor?.companyName} type='text' placeholder='ACME S.L.' required disabled />
                  <InputGroupAddon>
                    <BuildingIcon />
                  </InputGroupAddon>
                  <InputGroupAddon align='inline-end'>
                    <button onClick={(e) => copyToClipboard(e, invoice?.sellerInvestor?.companyName ?? '')} className='group'>
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
                <FieldLabel htmlFor='debtorTaxId'>CIF/NIF del deudor:</FieldLabel>
                <InputGroup>
                  <InputGroupInput id='debtorTaxId' value={invoice?.debtor?.taxId} type='text' placeholder='12345678A' required disabled />
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
                <FieldLabel htmlFor='debtorCompanyName'>Razón social del deudor:</FieldLabel>
                <InputGroup>
                  <InputGroupInput id='debtorCompanyName' value={invoice?.debtor?.companyName} type='text' placeholder='ACME S.L.' required disabled />
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
            </FieldGroup>
            <FieldGroup>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className='ms-auto w-min' disabled={JSON.stringify(originalInvoice) === JSON.stringify(invoice) && !form.formState.isDirty}>
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
          </form>
        </Form>

        <InvoiceChangeHistory invoice={invoice} />
      </div>

      <InvoiceDocuments invoiceId={invoice?.id ?? ''} />
    </section>
  )
}

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Form } from '@/components/ui/form'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select.tsx'
import { Spinner } from '@/components/ui/spinner'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import useLoggedInUser from '@/hooks/use-loggedInUser.ts'
import { parseDateOnly, toDateOnlyString } from '@/lib/format-date'
import { getDebtors } from '@/services/debtor.api.ts'
import { createInvoice } from '@/services/invoice.api'
import { type Debtor, DebtorStatus } from '@/types/Debtor.ts'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  CircleQuestionMarkIcon,
  FileIcon,
  FileTextIcon,
  KeyRoundIcon,
  SaveIcon,
  SearchIcon
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import z from 'zod'

const formSchema = z.object({
  debtorId: z.uuid('El deudor no es válido'),
  amount: z.coerce.number<number>(),
  dueDate: z.date('La fecha de vencimiento no es válida').refine((date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selectedDate = new Date(date)
    selectedDate.setHours(0, 0, 0, 0)
    return selectedDate > today
  }, {
    message: 'La fecha de vencimiento debe ser posterior a la fecha actual'
  }),
  invoiceId: z.string()
    .min(1, 'El identificador de factura es obligatorio')
    .or(z.literal('')),
  file: z.custom<FileList>()
    .refine((files) => files && files.length > 0, 'El documento es obligatorio')
    .refine((files) => files?.[0]?.size > 0, 'El documento no puede estar vacío')
}).refine((data) => {
  if (data.file || data.invoiceId) {
    return data.file && data.invoiceId
  }
  return true
})

export default function CreateInvoicePage () {
  const [verifiedDebtors, setVerifiedDebtors] = useState<[Debtor]>()
  const [debtorSearch, setDebtorSearch] = useState('')
  const [isLoadingDebtors, setIsLoadingDebtors] = useState(false)

  const baseForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: {
      debtorId: '',
      amount: undefined,
      dueDate: undefined,
      invoiceId: '',
      file: undefined
    }
  })


  const loggedInUser = useLoggedInUser()
  useEffect(() => {
    if (!loggedInUser) return

    const timer = setTimeout(() => {
      setIsLoadingDebtors(true)
      getDebtors({
        investorId: loggedInUser.id,
        companyName: debtorSearch ?? undefined,
        status: DebtorStatus.VERIFIED
      })
        .then(res => res.data)
        .then(debtors => setVerifiedDebtors(debtors))
        .finally(() => setIsLoadingDebtors(false))
    }, 300)

    return () => clearTimeout(timer)
  }, [loggedInUser, debtorSearch])

  const navigate = useNavigate()
  function onSubmit (data: z.infer<typeof formSchema>) {
    const formData = new FormData()
    formData.append('debtorId', data.debtorId)
    formData.append('amount', data.amount.toString())
    formData.append('dueDate', toDateOnlyString(data.dueDate))
    formData.append('invoiceId', data.invoiceId)
    formData.append('file', data.file?.[0])
    createInvoice(formData).then(res => navigate(`/invoices/${res.data.id}`))
  }

  return (
    <section className='flex flex-col gap-4'>
      <div className='flex items-center gap-2'>
        <span className='rounded-lg p-1 bg-primary/20 text-primary'>
          <FileTextIcon className='w-6 h-6' />
        </span>
        <h2>Publicar factura</h2>
      </div>
      <Card>
        <CardHeader>
          <h3>Detalles de la factura</h3>
        </CardHeader>
        <CardContent className='grid md:grid-cols-[1fr_200px] gap-4'>
          <Form {...baseForm}>
            <form onSubmit={baseForm.handleSubmit(onSubmit)} className='col-span-full flex flex-col gap-4'>
              <FieldSet>
                <FieldLegend>Información de la factura</FieldLegend>
                <FieldGroup className='grid grid-cols-1 lg:grid-cols-2'>
                  <Controller
                    name='debtorId'
                    control={baseForm.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Deudor:</FieldLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => field.onChange(value === '__NONE__' ? '' : value)}
                          defaultValue={'__NONE__'}
                        >
                          <SelectTrigger>
                            {verifiedDebtors?.find(debtor => debtor.id === field.value)?.companyName || 'Selecciona un deudor'}
                          </SelectTrigger>
                          <SelectContent>
                            <InputGroup className='border-0 border-b w-full'>
                              <InputGroupInput
                                value={debtorSearch}
                                onChange={e => setDebtorSearch(e.target.value)}
                                onKeyDown={e => e.stopPropagation()}
                                onKeyUp={e => e.stopPropagation()}
                                type='text'
                                placeholder='Razón social del deudor...'
                                autoComplete='off'
                              />
                              <InputGroupAddon>
                                {isLoadingDebtors ? <Spinner /> : <SearchIcon />}
                              </InputGroupAddon>
                            </InputGroup>
                            <SelectItem value='__NONE__'>
                              <span className='text-muted-foreground'>
                                Selecciona un deudor
                              </span>
                            </SelectItem>
                            {verifiedDebtors?.map(debtor => (
                              <SelectItem key={debtor.id} value={debtor.id}>
                                {debtor.companyName}
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
                </FieldGroup>
                <FieldGroup className='grid grid-cols-1 lg:grid-cols-2'>
                  <Controller
                    name='amount'
                    control={baseForm.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Importe:</FieldLabel>
                        <InputGroup>
                          <InputGroupInput {...field} id={field.name} type='number' placeholder='1000' />
                          <InputGroupAddon>
                            €
                          </InputGroupAddon>
                        </InputGroup>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name='dueDate'
                    control={baseForm.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Fecha de vencimiento:</FieldLabel>
                        <DatePicker
                          id={field.name}
                          value={field.value instanceof Date ? toDateOnlyString(field.value) : ''}
                          onChange={(dateStr) => {
                            const newDate = dateStr ? parseDateOnly(dateStr) : undefined
                            field.onChange(newDate)
                            baseForm.trigger('dueDate')
                          }}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </FieldGroup>
              </FieldSet>
              <FieldSet>
                <FieldLegend>Documentación</FieldLegend>
                <FieldGroup className='grid grid-cols-1 lg:grid-cols-2'>
                  <Controller
                    name='invoiceId'
                    control={baseForm.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>CSV:</FieldLabel>
                        <InputGroup>
                          <InputGroupInput {...field} id={field.name} type='text' placeholder='B12345678-F001-00001234-20260216-A9K3' />
                          <InputGroupAddon>
                            <KeyRoundIcon />
                          </InputGroupAddon>
                          <InputGroupAddon align={'inline-end'}>
                            <Tooltip>
                              <TooltipTrigger className='leading-1'>
                                <CircleQuestionMarkIcon className='w-4 h-4'/>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className='text-center'>Identificador del Registro de Facturación:<br />NIF/CIF/DNI del emisor + Serie + Número factura<br />+ Fecha + Código de verificación</p>
                              </TooltipContent>
                            </Tooltip>
                          </InputGroupAddon>
                        </InputGroup>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name='file'
                    control={baseForm.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Documento:</FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            aria-invalid={fieldState.invalid}
                            id={field.name}
                            onChange={(e) => field.onChange(e.target.files)}
                            onBlur={field.onBlur}
                            ref={field.ref}
                            type='file'
                            accept='image/jpg,image/jpeg,image/png,.pdf'
                            aria-description='Fotocopia que permita visualizar el documento completo'
                          />
                          <InputGroupAddon>
                            <FileIcon />
                          </InputGroupAddon>
                        </InputGroup>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </FieldGroup>
              </FieldSet>
              <Button
                className='w-min self-end justify-self-end'
                disabled={!baseForm.formState.isDirty}
                title='Crear deudor'
              >
                <SaveIcon />
                Subir factura
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </section>
  )
}

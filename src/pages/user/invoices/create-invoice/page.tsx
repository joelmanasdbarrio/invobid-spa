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
import { parseLocalDate, toDateOnlyString } from '@/lib/format-date'
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
  }).refine((date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const minDueDate = new Date(today)
    minDueDate.setMonth(minDueDate.getMonth() + 1)
    minDueDate.setDate(minDueDate.getDate() + 7)
    const selectedDate = new Date(date)
    selectedDate.setHours(0, 0, 0, 0)
    return selectedDate >= minDueDate
  }, {
    message: 'La fecha de vencimiento debe ser al menos 5 semanas en el futuro'
  }),
  svc: z.string()
    .min(1, 'El CSV es obligatorio'),
  file: z.custom<FileList>()
    .refine((files) => files && files.length > 0, 'El documento es obligatorio')
    .refine((files) => files?.[0]?.size > 0, 'El documento no puede estar vacío')
})

export default function CreateInvoicePage () {
  const [verifiedDebtors, setVerifiedDebtors] = useState<[Debtor]>()
  const [debtorSearch, setDebtorSearch] = useState('')
  const [isLoadingDebtors, setIsLoadingDebtors] = useState(false)

  const minDueDate = (() => {
    const d = new Date()
    d.setMonth(d.getMonth() + 1)
    d.setDate(d.getDate() + 7)
    d.setHours(0, 0, 0, 0)
    return d.toISOString()
  })()

  const baseForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: {
      debtorId: '',
      amount: undefined,
      dueDate: undefined,
      svc: '',
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
    formData.append('svc', data.svc)
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
      <Form {...baseForm}>
        <form onSubmit={baseForm.handleSubmit(onSubmit)} className='flex flex-col gap-4'>
          <Card>
            <CardHeader>
              <h3>Detalles de la factura</h3>
            </CardHeader>
            <CardContent>
              <FieldSet>
                <FieldLegend>Información de la factura</FieldLegend>
                <FieldGroup className='grid md:grid-cols-2 gap-4'>
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
                              <InputGroupAddon align={'inline-end'}>
                                <Tooltip>
                                  <TooltipTrigger className='leading-1'>
                                    <CircleQuestionMarkIcon className='w-4 h-4'/>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className='text-center'>Solo deudores verificados</p>
                                  </TooltipContent>
                                </Tooltip>
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
                <FieldGroup className='grid md:grid-cols-2 gap-4'>
                  <Controller
                    name='amount'
                    control={baseForm.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Importe:</FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            name={field.name}
                            id={field.name}
                            type='number'
                            step='0.01'
                            placeholder='1000'
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
                          minDate={minDueDate}
                          onChange={(dateStr) => {
                            const newDate = dateStr ? parseLocalDate(dateStr) : undefined
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
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <FieldSet>
                <FieldLegend>Documentación</FieldLegend>
                <FieldGroup className='grid md:grid-cols-2 gap-4'>
                  <Controller
                    name='svc'
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
                          <InputGroupAddon align={'inline-end'}>
                            <Tooltip>
                              <TooltipTrigger className='leading-1'>
                                <CircleQuestionMarkIcon className='w-4 h-4'/>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className='text-center'>Fotocopia que permita visualizar el documento completo</p>
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
                </FieldGroup>
              </FieldSet>
            </CardContent>
          </Card>

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
    </section>
  )
}

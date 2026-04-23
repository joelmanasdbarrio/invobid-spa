import { ColorBadge } from '@/components/color-badge'
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Form } from '@/components/ui/form'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getDebtorById, updateDebtorById } from '@/services/debtor.api'
import { DebtorStatus, type Debtor } from '@/types/Debtor'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCheckIcon, CircleAlertIcon, ClockIcon, HandCoinsIcon, IdCardIcon, MailIcon, OctagonXIcon, PhoneIcon, RefreshCcwIcon, SaveIcon, UsersIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router'
import z from 'zod'
import DebtorInvoices from './components/debtor-invoices/debtor-invoices'

const validateFormSchema = z.object({
  status: z.enum(DebtorStatus)
})

const baseFormSchema = z.object({
  companyName: z.string().min(2, 'El nombre de la empresa debe tener al menos 2 caracteres'),
  taxId: z.string().min(7, 'El NIF/CIF debe tener al menos 7 caracteres'),
  email: z.email('Correo electrónico no válido'),
  phoneNumber: z.coerce.number<number>().min(6, 'El número de teléfono debe tener al menos 6 caracteres')
})

// const documentFormSchema = z.object({
//   modelo111QuarterlyCsv: z.string()
//     .min(1, 'El CSV es obligatorio para el modelo 111 trimestral')
//     .or(z.literal('')),
//   modelo111Quarterly: z.custom<FileList | undefined>()
//     .refine((files) => !files || files.length === 0 || files[0].size > 0, 'El documento no puede estar vacío'),
//   modelo303QuarterlyCsv: z.string()
//     .min(1, 'El CSV es obligatorio para el modelo 303 trimestral')
//     .or(z.literal('')),
//   modelo303Quarterly: z.custom<FileList | undefined>()
//     .refine((files) => !files || files.length === 0 || files[0].size > 0, 'El documento no puede estar vacío'),

//   modelo111AnnualCsv: z.string()
//     .min(1, 'El CSV es obligatorio para el modelo 111 anual')
//     .or(z.literal('')),
//   modelo111Annual: z.custom<FileList | undefined>()
//     .refine((files) => !files || files.length === 0 || files[0].size > 0, 'El documento no puede estar vacío'),
//   modelo303AnnualCsv: z.string()
//     .min(1, 'El CSV es obligatorio para el modelo 303 anual')
//     .or(z.literal('')),
//   modelo303Annual: z.custom<FileList | undefined>()
//     .refine((files) => !files || files.length === 0 || files[0].size > 0, 'El documento no puede estar vacío')
// }).superRefine((data, ctx) => {
//   const pairs = [
//     { file: 'modelo111Quarterly', svc: 'modelo111QuarterlyCsv' },
//     { file: 'modelo303Quarterly', svc: 'modelo303QuarterlyCsv' },
//     { file: 'modelo111Annual', svc: 'modelo111AnnualCsv' },
//     { file: 'modelo303Annual', svc: 'modelo303AnnualCsv' }
//   ] as const
//   for (const { file, svc } of pairs) {
//     const hasFile = ((data[file] as FileList | undefined)?.length ?? 0) > 0
//     const hasSvc = !!data[svc]
//     if (hasFile && !hasSvc) {
//       ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'El CSV es obligatorio', path: [svc] })
//     }
//     if (!hasFile && hasSvc) {
//       ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'El documento es obligatorio', path: [file] })
//     }
//   }
// })

export default function DebtorPage ({setLastBreadcrumb}: { setLastBreadcrumb: (breadcrumb: string) => void }) {
  const {debtorId} = useParams<{ debtorId: string }>()
  const [debtor, setDebtor] = useState<Debtor | undefined>()
  const [originalDebtor, setOriginalDebtor] = useState<Debtor | undefined>(debtor)

  const isFormDisabled = !debtor || debtor.status !== DebtorStatus.CORRECTION

  const validateForm = useForm<z.infer<typeof validateFormSchema>>({
    resolver: zodResolver(validateFormSchema),
    mode: 'onTouched',
    defaultValues: {
      status: debtor?.status
    }
  })

  const baseForm = useForm<z.infer<typeof baseFormSchema>>({
    resolver: zodResolver(baseFormSchema),
    mode: 'onTouched',
    defaultValues: {
      companyName: debtor?.companyName ?? '',
      taxId: debtor?.taxId ?? '',
      email: debtor?.email ?? '',
      phoneNumber: debtor?.phoneNumber ?? 0
    }
  })

  // const documentForm = useForm<z.infer<typeof documentFormSchema>>({
  //   resolver: zodResolver(documentFormSchema),
  //   mode: 'onTouched',
  //   defaultValues: {
  //     modelo111QuarterlyCsv: '',
  //     modelo111Quarterly: undefined,
  //     modelo303QuarterlyCsv: '',
  //     modelo303Quarterly: undefined,
  //     modelo111AnnualCsv: '',
  //     modelo111Annual: undefined,
  //     modelo303AnnualCsv: '',
  //     modelo303Annual: undefined
  //   }
  // })

  useEffect(() => {
    baseForm.reset({
      companyName: debtor?.companyName ?? '',
      taxId: debtor?.taxId ?? '',
      email: debtor?.email ?? '',
      phoneNumber: debtor?.phoneNumber ?? 0
    })
  }, [debtor, baseForm])

  const navigate = useNavigate()
  useEffect(() => {
    if (!debtorId) return
    getDebtorById(debtorId)
      .then(res => res.data)
      .then(data => {
        setDebtor(data)
        setOriginalDebtor(data)
        setLastBreadcrumb(data.companyName)
      })
      .catch(() => {
        navigate('/user/debtors')
      })
  }, [debtorId, navigate, setLastBreadcrumb])

  function onSubmitBase (data: z.infer<typeof baseFormSchema>) {
    if (!debtorId) return
    updateDebtorById(debtorId, JSON.stringify({
      companyName: data.companyName,
      taxId: data.taxId,
      email: data.email,
      phoneNumber: data.phoneNumber
    }))
      .then(res => setDebtor(res.data))
      .then(() => navigate(`/user/debtors/${debtorId}`))
  }

  // function onSubmitDocument (data: z.infer<typeof documentFormSchema>) {
  //   if (!debtorId) return
  //   const formData = new FormData()
  //   if (data.modelo111Quarterly?.[0] && data.modelo111QuarterlyCsv) {
  //     formData.append(DocumentType.TAX_111_QUARTERLY, data.modelo111Quarterly[0])
  //     formData.append('modelo111QuarterlyCsv', data.modelo111QuarterlyCsv)
  //   }
  //   if (data.modelo303Quarterly?.[0] && data.modelo303QuarterlyCsv) {
  //     formData.append(DocumentType.TAX_303_QUARTERLY, data.modelo303Quarterly[0])
  //     formData.append('modelo303QuarterlyCsv', data.modelo303QuarterlyCsv)
  //   }
  //   if (data.modelo111Annual?.[0] && data.modelo111AnnualCsv) {
  //     formData.append(DocumentType.TAX_111_ANNUAL, data.modelo111Annual[0])
  //     formData.append('modelo111AnnualCsv', data.modelo111AnnualCsv)
  //   }
  //   if (data.modelo303Annual?.[0] && data.modelo303AnnualCsv) {
  //     formData.append(DocumentType.TAX_303_ANNUAL, data.modelo303Annual[0])
  //     formData.append('modelo303AnnualCsv', data.modelo303AnnualCsv)
  //   }
  //   updateDebtorById(debtorId, formData)
  //     .then(res => setDebtor(res.data))
  // }

  function onSubmitValidate (data: z.infer<typeof validateFormSchema>) {
    if (!debtorId) return
    updateDebtorById(debtorId, JSON.stringify({
      status: data.status
    }))
      .then(res => setDebtor(res.data))
      .then(() => navigate(`/user/debtors/${debtorId}`))
  }

  const debtorStatusTextMap: {
    pending: { title: string; icon: React.JSX.Element };
    correction: { title: string; icon: React.JSX.Element };
    denied: { title: string; icon: React.JSX.Element }
  } = {
    pending: {
      title: 'Pendiente de verificación',
      icon: <ClockIcon className='w-full h-full rounded-full text-yellow-600 bg-yellow-300/25 p-2'/>
    },
    correction: {
      title: 'Corrección requerida',
      icon: <CircleAlertIcon className='w-full h-full rounded-full text-red-600 bg-red-300/25 p-2'/>
    },
    denied: {
      title: 'Deudor denegado',
      icon: <OctagonXIcon className='w-full h-full rounded-full text-zinc-600 bg-zinc-300/25 p-2'/>
    }
  }

  return (
    <section className='flex flex-col gap-4'>
      <div className='flex items-center gap-2'>
        <span className='rounded-lg p-1 bg-primary/20 text-primary'>
          <HandCoinsIcon className='w-6 h-6' />
        </span>
        <h2>Gestionar deudor</h2>
        {(debtor?.status === DebtorStatus.CORRECTION || debtor?.status === DebtorStatus.PENDING) && (
          <Form {...validateForm}>
            <form onSubmit={validateForm.handleSubmit(onSubmitValidate)} className='ms-auto flex md:justify-end **:data-[slot=field-group]:grid lg:**:data-[slot=field-group]:grid-cols-2'>
              <Button
                variant='outline'
                className='group'
                disabled={isFormDisabled}
                onClick={() => {
                  validateForm.setValue('status', DebtorStatus.PENDING)
                  validateForm.handleSubmit(onSubmitValidate)()
                }}
              >
                <RefreshCcwIcon className='transition-all group-hover:rotate-180 duration-200' />
                <span className='overflow-hidden'>
                  Solicitar verificación
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
                <h3>Detalle del deudor <span className='text-primary'>{debtor?.companyName}</span></h3>
                <div className='ms-auto'>
                  {debtor?.status ===DebtorStatus.PENDING && (
                    <ColorBadge color='yellow' icon={<ClockIcon />}>
                      Pendiente
                    </ColorBadge>
                  )}
                  {debtor?.status ===DebtorStatus.VERIFIED && (
                    <ColorBadge color='green' icon={<CheckCheckIcon />}>
                      Verificado
                    </ColorBadge>
                  )}
                  {debtor?.status ===DebtorStatus.CORRECTION && (
                    <ColorBadge color='red' icon={<CircleAlertIcon />}>
                      Corrección
                    </ColorBadge>
                  )}
                  {debtor?.status ===DebtorStatus.DENIED && (
                    <ColorBadge color='gray' icon={<OctagonXIcon />}>
                      Denegado
                    </ColorBadge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <FieldSet>
                <FieldLegend>Información de contacto</FieldLegend>
                <FieldGroup>
                  <Controller
                    name='taxId'
                    control={baseForm.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>NIF/CIF:</FieldLabel>
                        <InputGroup>
                          <InputGroupInput {...field} id={field.name} type='text' disabled={isFormDisabled} />
                          <InputGroupAddon>
                            <IdCardIcon/>
                          </InputGroupAddon>
                        </InputGroup>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name='companyName'
                    control={baseForm.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Razón social:</FieldLabel>
                        <InputGroup>
                          <InputGroupInput {...field} id={field.name} type='text' disabled={isFormDisabled} />
                          <InputGroupAddon>
                            <UsersIcon />
                          </InputGroupAddon>
                        </InputGroup>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </FieldGroup>
                <FieldGroup>
                  <Controller
                    name='email'
                    control={baseForm.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Correo electrónico:</FieldLabel>
                        <InputGroup>
                          <InputGroupInput {...field} id={field.name} type='email' disabled={isFormDisabled} />
                          <InputGroupAddon>
                            <MailIcon />
                          </InputGroupAddon>
                        </InputGroup>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name='phoneNumber'
                    control={baseForm.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Número de teléfono:</FieldLabel>
                        <InputGroup>
                          <InputGroupInput {...field} id={field.name} type='number' disabled={isFormDisabled} />
                          <InputGroupAddon>
                            <PhoneIcon />
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
            disabled={JSON.stringify(originalDebtor) === JSON.stringify(debtor) && !baseForm.formState.isDirty}
            title='Guardar cambios'
          >
            <SaveIcon />
            Guardar cambios
          </Button>
        </form>
      </Form>

      {/* <Form {...documentForm}>
        <form onSubmit={documentForm.handleSubmit(onSubmitDocument)} className='flex flex-col gap-4 **:data-[slot=field-group]:grid lg:**:data-[slot=field-group]:grid-cols-2'>
          <Card>
            <CardContent className='flex flex-col gap-4'>
              <FieldSet>
                <FieldLegend>Documentación trimestral</FieldLegend>
                <FieldDescription>Modelo 111</FieldDescription>
                <FieldGroup>
                  <Controller
                    name='modelo111QuarterlyCsv'
                    control={documentForm.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>CSV:</FieldLabel>
                        <InputGroup>
                          <InputGroupInput {...field} id={field.name} type='text' placeholder='A1B2C3D4E5F6G7H8' />
                          <InputGroupAddon>
                            <KeyRoundIcon />
                          </InputGroupAddon>
                        </InputGroup>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name='modelo111Quarterly'
                    control={documentForm.control}
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
                <FieldDescription>Modelo 303</FieldDescription>
                <FieldGroup>
                  <Controller
                    name='modelo303QuarterlyCsv'
                    control={documentForm.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>CSV:</FieldLabel>
                        <InputGroup>
                          <InputGroupInput {...field} id={field.name} type='text' placeholder='A1B2C3D4E5F6G7H8' />
                          <InputGroupAddon>
                            <KeyRoundIcon />
                          </InputGroupAddon>
                        </InputGroup>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name='modelo303Quarterly'
                    control={documentForm.control}
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

              <FieldSet>
                <FieldLegend>Documentación Annual</FieldLegend>
                <FieldDescription>Modelo 111</FieldDescription>
                <FieldGroup>
                  <Controller
                    name='modelo111AnnualCsv'
                    control={documentForm.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>CSV:</FieldLabel>
                        <InputGroup>
                          <InputGroupInput {...field} id={field.name} type='text' placeholder='A1B2C3D4E5F6G7H8' />
                          <InputGroupAddon>
                            <KeyRoundIcon />
                          </InputGroupAddon>
                        </InputGroup>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name='modelo111Annual'
                    control={documentForm.control}
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
                <FieldDescription>Modelo 303</FieldDescription>
                <FieldGroup>
                  <Controller
                    name='modelo303AnnualCsv'
                    control={documentForm.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>CSV:</FieldLabel>
                        <InputGroup>
                          <InputGroupInput {...field} id={field.name} type='text' placeholder='A1B2C3D4E5F6G7H8' />
                          <InputGroupAddon>
                            <KeyRoundIcon />
                          </InputGroupAddon>
                        </InputGroup>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name='modelo303Annual'
                    control={documentForm.control}
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
            </CardContent>
          </Card>

          <Button
            className='w-min self-end justify-self-end'
            disabled={!documentForm.formState.isDirty}
            title='Actualizar documentos'
          >
            <SaveIcon />
            Actualizar documentos
          </Button>
        </form>
      </Form> */}

      <Tabs defaultValue='invoices' className='gap-4'>
        <TabsList>
          <TabsTrigger value='invoices'>Facturas</TabsTrigger>
          {/* <TabsTrigger value='documents'>Documentos</TabsTrigger> */}
        </TabsList>
        <TabsContent value='invoices'>
          <DebtorInvoices debtorId={debtorId} />
        </TabsContent>
        {/* <TabsContent value='documents'>
          <DebtorDocuments debtorId={debtorId} />
        </TabsContent> */}
      </Tabs>

      {(debtor?.status && debtor.status !== DebtorStatus.VERIFIED) && (
        <AlertDialog defaultOpen>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Actualización del deudor</AlertDialogTitle>
              <AlertDialogDescription>
                Compruebe el estado del deudor y ejecute las acciones necesarias. Una vez corregida la incidencia, solicite nuevamente la verificación.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Item variant='muted' className='gap-2'>
              <ItemMedia className='self-center! w-10 h-10'>
                {debtorStatusTextMap[debtor?.status].icon}
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{debtorStatusTextMap[debtor?.status].title}</ItemTitle>
                <ItemDescription>
                  {debtor?.lastCommunication}
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

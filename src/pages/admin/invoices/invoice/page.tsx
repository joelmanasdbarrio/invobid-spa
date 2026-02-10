import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field'
import { Form } from '@/components/ui/form'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { getDebtorById, updateDebtorById } from '@/services/debtor.api'
import { DebtorStatus, type Debtor } from '@/types/Debtor'
import { zodResolver } from '@hookform/resolvers/zod'
import { CircleAlertIcon, ClockIcon, FileIcon, IdCardIcon, KeyRoundIcon, MailIcon, OctagonXIcon, PhoneIcon, RefreshCcwIcon, SaveIcon, UsersIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router'
import z from 'zod'

const validateFormSchema = z.object({
  status: z.enum(DebtorStatus)
})

const baseFormSchema = z.object({
  companyName: z.string().min(2, 'El nombre de la empresa debe tener al menos 2 caracteres'),
  taxId: z.string().min(7, 'El NIF/CIF debe tener al menos 7 caracteres'),
  email: z.email('Correo electrónico no válido'),
  phoneNumber: z.string().min(6, 'El número de teléfono debe tener al menos 6 caracteres')
})

const documentFormSchema = z.object({
  modelo111Csv: z.string()
    .min(1, 'El CSV es obligatorio para el modelo 111')
    .optional()
    .or(z.literal('')),
  modelo111: z.custom<FileList>()
    .refine((files) => files && files.length > 0, 'El documento 111 es obligatorio')
    .refine((files) => files?.[0]?.size > 0, 'El documento no puede estar vacío')
    .transform((files) => files[0]).optional(),
  modelo303Csv: z.string()
    .min(1, 'El CSV es obligatorio para el modelo 303')
    .optional()
    .or(z.literal('')),
  modelo303: z.custom<FileList>()
    .refine((files) => files && files.length > 0, 'El documento 303 es obligatorio')
    .refine((files) => files?.[0]?.size > 0, 'El documento no puede estar vacío')
    .transform((files) => files[0]).optional()
}).refine((data) => {
  if (data.modelo111 || data.modelo111Csv) {
    return data.modelo111 && data.modelo111Csv
  }
  if (data.modelo303 || data.modelo303Csv) {
    return data.modelo303 && data.modelo303Csv
  }
  return true
})

export default function DebtorPage () {
  const {debtorId} = useParams()
  const [debtor, setDebtor] = useState<Debtor | undefined>()
  const [originalDebtor, setOriginalDebtor] = useState<Debtor | undefined>(debtor)

  const isFormDisabled = debtor?.status === DebtorStatus.PENDING || debtor?.status === DebtorStatus.DENIED

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
      phoneNumber: debtor?.phoneNumber ?? ''
    }
  })

  const documentForm = useForm<z.infer<typeof documentFormSchema>>({
    resolver: zodResolver(documentFormSchema),
    mode: 'onTouched',
    defaultValues: {
      modelo111Csv: '',
      modelo111: undefined,
      modelo303Csv: '',
      modelo303: undefined
    }
  })

  useEffect(() => {
    baseForm.reset({
      companyName: debtor?.companyName ?? '',
      taxId: debtor?.taxId ?? '',
      email: debtor?.email ?? '',
      phoneNumber: debtor?.phoneNumber ?? ''
    })
  }, [debtor, baseForm])

  const navigate = useNavigate()
  useEffect(() => {
    if (debtorId) {
      getDebtorById(debtorId)
        .then(res => res.data)
        .then(data => {
          setDebtor(data)
          setOriginalDebtor(data)
        })
        .catch(() => {
          navigate('/user/debtors')
        })
    }
  }, [debtorId, navigate])

  function onSubmitBase (data: z.infer<typeof baseFormSchema>) {
    updateDebtorById(debtorId, JSON.stringify({
      companyName: data.companyName,
      taxId: data.taxId,
      email: data.email,
      phoneNumber: data.phoneNumber
    })).then(res => setDebtor(res.data))
  }

  function onSubmitDocument (data: z.infer<typeof documentFormSchema>) {
    const formData = new FormData()
    formData.append('modelo111', data.modelo111)
    formData.append('modelo111Csv', data.modelo111Csv)
    formData.append('modelo303', data.modelo303)
    formData.append('modelo303Csv', data.modelo303Csv)
    updateDebtorById(debtorId, formData).then(res => setDebtor(res.data))
  }

  function onSubmitValidate (data: z.infer<typeof validateFormSchema>) {
    updateDebtorById(debtorId, JSON.stringify({
      status: data.status
    })).then(res => setDebtor(res.data))
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
    <section className='grid md:grid-cols-[1fr_200px] gap-4'>
      <h3 className='text-lg'>Detalles del deudor {debtor?.companyName}</h3>
      <Form {...validateForm}>
        <form onSubmit={validateForm.handleSubmit(onSubmitValidate)} className='flex md:justify-end'>
          {(debtor?.status === DebtorStatus.CORRECTION || debtor?.status === DebtorStatus.PENDING) && (
            <Button
              variant='outline'
              className='group md:w-10 md:hover:w-full md:max-w-min md:gap-0 md:hover:gap-2 duration-200'
              disabled={debtor?.status === DebtorStatus.PENDING || isFormDisabled}
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
          )}
        </form>
      </Form>
      <Form {...baseForm}>
        <form onSubmit={baseForm.handleSubmit(onSubmitBase)} className='col-span-full flex flex-col gap-4'>
          <FieldGroup className='grid grid-cols-1 lg:grid-cols-[1fr_1fr_minmax(10px,40px)]'>
            <Controller
              name='taxId'
              control={baseForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>NIF/CIF:</FieldLabel>
                  <InputGroup>
                    <InputGroupInput {...field} id={field.name} type='text' disabled={debtor?.status === DebtorStatus.VERIFIED || isFormDisabled} />
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
                    <InputGroupInput {...field} id={field.name} type='text' disabled={debtor?.status === DebtorStatus.VERIFIED || isFormDisabled} />
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
          <FieldGroup className='grid grid-cols-1 lg:grid-cols-[1fr_1fr_minmax(10px,40px)]'>
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
                    <InputGroupInput {...field} id={field.name} type='text' disabled={isFormDisabled} />
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
            <Button
              className='w-min self-end justify-self-end'
              disabled={JSON.stringify(originalDebtor) === JSON.stringify(debtor) && !baseForm.formState.isDirty}
              title='Guardar cambios'
            >
              <SaveIcon />
              <span className='lg:hidden'>
                Guardar cambios
              </span>
            </Button>
          </FieldGroup>
        </form>
      </Form>
      <FieldSeparator className='col-span-full' />
      <Form {...documentForm}>
        <form onSubmit={documentForm.handleSubmit(onSubmitDocument)} className='col-span-full flex flex-col gap-4'>
          <h4 className='text-md col-span-full font-bold'>Actualizar documentos</h4>
          <h5 className='text-md col-span-full'>Modelo 111</h5>
          <FieldGroup className='grid grid-cols-1 lg:grid-cols-[1fr_1fr_minmax(10px,40px)]'>
            <Controller
              name='modelo111Csv'
              control={documentForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>CSV:</FieldLabel>
                  <InputGroup>
                    <InputGroupInput {...field} id={field.name} type='text' placeholder='A1B2C3D4E5F6G7H8' disabled={isFormDisabled} />
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
              name='modelo111'
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
                      disabled={isFormDisabled}
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
          <h5 className='text-md col-span-full'>Modelo 303</h5>
          <FieldGroup className='grid grid-cols-1 lg:grid-cols-[1fr_1fr_minmax(10px,40px)]'>
            <Controller
              name='modelo303Csv'
              control={documentForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>CSV:</FieldLabel>
                  <InputGroup>
                    <InputGroupInput {...field} id={field.name} type='text' placeholder='A1B2C3D4E5F6G7H8' disabled={isFormDisabled} />
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
              name='modelo303'
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
                      disabled={isFormDisabled}
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
            <Button
              className='w-min self-end justify-self-end'
              disabled={!documentForm.formState.isDirty}
              title='Actualizar documentos'
            >
              <SaveIcon />
              <span className='lg:hidden'>
                Actualizar documentos
              </span>
            </Button>
          </FieldGroup>
        </form>
      </Form>

      {(debtor?.status && debtor.status !== DebtorStatus.VERIFIED) && (
        <AlertDialog defaultOpen>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Actualización del deudor</AlertDialogTitle>
              <AlertDialogDescription>
                Comprueba el estado del deudor y ejecuta las acciones necesarias:
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

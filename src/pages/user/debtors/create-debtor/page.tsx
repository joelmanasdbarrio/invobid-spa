import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Form } from '@/components/ui/form'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { createDebtor } from '@/services/debtor.api'
import { zodResolver } from '@hookform/resolvers/zod'
import { FileIcon, IdCardIcon, KeyRoundIcon, MailIcon, PhoneIcon, SaveIcon, UsersIcon } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import z from 'zod'

const formSchema = z.object({
  companyName: z.string().min(2, 'El nombre de la empresa debe tener al menos 2 caracteres'),
  taxId: z.string().min(7, 'El NIF/CIF debe tener al menos 7 caracteres'),
  email: z.email('Correo electrónico no válido'),
  phoneNumber: z.string().min(6, 'El número de teléfono debe tener al menos 6 caracteres'),
  modelo111Csv: z.string()
    .min(1, 'El CSV es obligatorio para el modelo 111'),
  modelo111: z.custom<FileList>()
    .refine((files) => files && files.length > 0, 'El documento es obligatorio')
    .refine((files) => files?.[0]?.size > 0, 'El documento no puede estar vacío'),
  modelo303Csv: z.string()
    .min(1, 'El CSV es obligatorio para el modelo 303'),
  modelo303: z.custom<FileList>()
    .refine((files) => files && files.length > 0, 'El documento es obligatorio')
    .refine((files) => files?.[0]?.size > 0, 'El documento no puede estar vacío')
})

export default function CreateDebtorPage () {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: {
      companyName: '',
      taxId: '',
      email: '',
      phoneNumber: '',
      modelo111Csv: '',
      modelo111: undefined,
      modelo303Csv: '',
      modelo303: undefined
    }
  })

  const navigate = useNavigate()
  function onSubmit (data: z.infer<typeof formSchema>) {
    const formData = new FormData()
    formData.append('companyName', data.companyName)
    formData.append('taxId', data.taxId)
    formData.append('email', data.email)
    formData.append('phoneNumber', data.phoneNumber)
    formData.append('modelo111', data.modelo111[0])
    formData.append('modelo111Csv', data.modelo111Csv)
    formData.append('modelo303', data.modelo303[0])
    formData.append('modelo303Csv', data.modelo303Csv)
    createDebtor(formData).then(res => navigate(`/debtors/${res.data.id}`))
  }

  return (
    <section className='grid md:grid-cols-[1fr_200px] gap-4'>
      <h3 className='text-lg'>Registrar un nuevo deudor</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='col-span-full flex flex-col gap-4'>
          <FieldGroup className='grid grid-cols-1 lg:grid-cols-2'>
            <Controller
              name='taxId'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>NIF/CIF:</FieldLabel>
                  <InputGroup>
                    <InputGroupInput {...field} id={field.name} type='text' placeholder='A1B2C3D4E5F6G7H8'/>
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
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Razón social:</FieldLabel>
                  <InputGroup>
                    <InputGroupInput {...field} id={field.name} type='text' placeholder='Enterprise S.L.' />
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
            <Controller
              name='email'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Correo electrónico:</FieldLabel>
                  <InputGroup>
                    <InputGroupInput {...field} id={field.name} type='email' placeholder='example@mail.com' />
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
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Número de teléfono:</FieldLabel>
                  <InputGroup>
                    <InputGroupInput {...field} id={field.name} type='text' placeholder='34600123456' />
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
            <h5 className='text-md col-span-full'>Modelo 111</h5>
            <Controller
              name='modelo111Csv'
              control={form.control}
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
              name='modelo111'
              control={form.control}
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
                      required
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
          <h5 className='text-md col-span-full'>Modelo 303</h5>
          <FieldGroup className='grid grid-cols-1 lg:grid-cols-2'>
            <Controller
              name='modelo303Csv'
              control={form.control}
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
              name='modelo303'
              control={form.control}
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
                      required
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
          <Button
            className='w-min self-end justify-self-end'
            disabled={!form.formState.isDirty}
            title='Crear deudor'
          >
            <SaveIcon />
            Crear deudor
          </Button>
        </form>
      </Form>
    </section>
  )
}

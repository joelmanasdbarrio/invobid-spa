import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Form } from '@/components/ui/form'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { createDebtor } from '@/services/debtor.api'
import { zodResolver } from '@hookform/resolvers/zod'
import { HandCoinsIcon, IdCardIcon, MailIcon, PhoneIcon, SaveIcon, UsersIcon } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import z from 'zod'

const formSchema = z.object({
  companyName: z.string().min(2, 'El nombre de la empresa debe tener al menos 2 caracteres'),
  taxId: z.string().min(7, 'El NIF/CIF debe tener al menos 7 caracteres'),
  email: z.email('Correo electrónico no válido'),
  phoneNumber: z.string().min(6, 'El número de teléfono debe tener al menos 6 caracteres')

  // modelo111QuarterlyCsv: z.string()
  //   .min(1, 'El CSV es obligatorio para el modelo 111 trimestral'),
  // modelo111Quarterly: z.custom<FileList>()
  //   .refine((files) => files && files.length > 0, 'El documento es obligatorio')
  //   .refine((files) => files?.[0]?.size > 0, 'El documento no puede estar vacío'),
  // modelo303QuarterlyCsv: z.string()
  //   .min(1, 'El CSV es obligatorio para el modelo 303 trimestral'),
  // modelo303Quarterly: z.custom<FileList>()
  //   .refine((files) => files && files.length > 0, 'El documento es obligatorio')
  //   .refine((files) => files?.[0]?.size > 0, 'El documento no puede estar vacío'),

  // modelo111AnnualCsv: z.string()
  //   .min(1, 'El CSV es obligatorio para el modelo 111 Annual'),
  // modelo111Annual: z.custom<FileList>()
  //   .refine((files) => files && files.length > 0, 'El documento es obligatorio')
  //   .refine((files) => files?.[0]?.size > 0, 'El documento no puede estar vacío'),
  // modelo303AnnualCsv: z.string()
  //   .min(1, 'El CSV es obligatorio para el modelo 303 Annual'),
  // modelo303Annual: z.custom<FileList>()
  //   .refine((files) => files && files.length > 0, 'El documento es obligatorio')
  //   .refine((files) => files?.[0]?.size > 0, 'El documento no puede estar vacío')
})

export default function CreateDebtorPage () {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: {
      companyName: '',
      taxId: '',
      email: '',
      phoneNumber: ''

      // modelo111QuarterlyCsv: '',
      // modelo111Quarterly: undefined,
      // modelo303QuarterlyCsv: '',
      // modelo303Quarterly: undefined,

      // modelo111AnnualCsv: '',
      // modelo111Annual: undefined,
      // modelo303AnnualCsv: '',
      // modelo303Annual: undefined
    }
  })

  const navigate = useNavigate()
  function onSubmit (data: z.infer<typeof formSchema>) {
    // const formData = new FormData()

    // formData.append('companyName', data.companyName)
    // formData.append('taxId', data.taxId)
    // formData.append('email', data.email)
    // formData.append('phoneNumber', data.phoneNumber)

    // formData.append(DocumentType.TAX_111_QUARTERLY, data.modelo111Quarterly[0])
    // formData.append('modelo111QuarterlyCsv', data.modelo111QuarterlyCsv)
    // formData.append(DocumentType.TAX_303_QUARTERLY, data.modelo303Quarterly[0])
    // formData.append('modelo303QuarterlyCsv', data.modelo303QuarterlyCsv)

    // formData.append(DocumentType.TAX_111_ANNUAL, data.modelo111Annual[0])
    // formData.append('modelo111AnnualCsv', data.modelo111AnnualCsv)
    // formData.append(DocumentType.TAX_303_ANNUAL, data.modelo303Annual[0])
    // formData.append('modelo303AnnualCsv', data.modelo303AnnualCsv)

    // createDebtor(formData).then(res => navigate(`/debtors/${res.data.id}`))
    createDebtor({
      companyName: data.companyName,
      taxId: data.taxId,
      email: data.email,
      phoneNumber: data.phoneNumber
    }).then(res => navigate(`/debtors/${res.data.id}`))
  }

  return (
    <section className='flex flex-col gap-4'>
      <div className='flex items-center gap-2'>
        <span className='rounded-lg p-1 bg-primary/20 text-primary'>
          <HandCoinsIcon className='size-6' />
        </span>
        <h2>Publicar deudor</h2>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4 **:data-[slot=field-group]:grid lg:**:data-[slot=field-group]:grid-cols-2'>
          <Card>
            <CardHeader>
              <h3>Detalles del deudor</h3>
            </CardHeader>
            <CardContent>
              <FieldSet>
                <FieldLegend>Información de contacto</FieldLegend>
                <FieldGroup>
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
                </FieldGroup>
                <FieldGroup>
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
                </FieldGroup>
              </FieldSet>
            </CardContent>
          </Card>

          {/* <Card>
            <CardContent className='flex flex-col gap-4'>
              <FieldSet>
                <FieldLegend>Documentación trimestral</FieldLegend>
                <FieldDescription>Modelo 111</FieldDescription>
                <FieldGroup>
                  <Controller
                    name='modelo111QuarterlyCsv'
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
                    name='modelo111Quarterly'
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
                <FieldDescription>Modelo 303</FieldDescription>
                <FieldGroup>
                  <Controller
                    name='modelo303QuarterlyCsv'
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
                    name='modelo303Quarterly'
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
              </FieldSet>

              <FieldSet>
                <FieldLegend>Documentación Annual</FieldLegend>
                <FieldDescription>Modelo 111</FieldDescription>
                <FieldGroup>
                  <Controller
                    name='modelo111AnnualCsv'
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
                    name='modelo111Annual'
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
                <FieldDescription>Modelo 303</FieldDescription>
                <FieldGroup>
                  <Controller
                    name='modelo303AnnualCsv'
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
                    name='modelo303Annual'
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
              </FieldSet>
            </CardContent>
          </Card> */}

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

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field'
import { Form } from '@/components/ui/form'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { createInvestor } from '@/services/investor.api'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { z } from 'zod'

const formSchema = z.object({
  investorType: z.enum(['individual', 'company'], {
    required_error: 'El tipo de inversor es obligatorio'
  }),
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  companyName: z.string()
    .min(1, 'La razón social es obligatoria'),
  email: z.email('Correo electrónico no válido'),
  phoneNumber: z.string()
    .min(6, 'El número de teléfono es obligatorio'),
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  passwordRepeat: z.string()
    .min(6, 'La repetición de la contraseña debe tener al menos 6 caracteres'),
  documentValue: z.string()
    .min(1, 'El CIF/NIF es obligatorio'),
  document: z.custom<FileList>()
    .refine((files) => files && files.length > 0, 'El documento es obligatorio')
    .refine((files) => files?.[0]?.size > 0, 'El documento no puede estar vacío')
    .transform((files) => files[0]),
  investorType: z.enum(['company']).default('company')
}).refine((data) => data.password === data.passwordRepeat, {
  message: 'Las contraseñas no coinciden',
  path: ['passwordRepeat']
})

export default function CompanyForm () {
  const navigate = useNavigate()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: {
      investorType: 'company',
      name: '',
      companyName: '',
      email: '',
      phoneNumber: '',
      password: '',
      passwordRepeat: '',
      documentValue: '',
      document: undefined
    }
  })

  function onSubmit (data: z.infer<typeof formSchema>) {
    const formData = new FormData()

    formData.append('investorType', data.investorType)
    formData.append('name', data.name)
    formData.append('companyName', data.companyName)
    formData.append('email', data.email)
    formData.append('phoneNumber', data.phoneNumber)
    formData.append('password', data.password)
    formData.append('passwordRepeat', data.passwordRepeat)
    formData.append('documentValue', data.documentValue)
    formData.append('document', data.document)

    createInvestor(formData, () => navigate('/'))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Empresa</CardTitle>
        <CardDescription>
          Subasta, invierte e intercanvia facturas con otras empresas e inversores.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4'>
            <FieldGroup className='flex flex-col gap-4 sm:grid sm:grid-cols-2'>
              <Controller
                name='name'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Nombre de la empresa</FieldLabel>
                    <InputGroup>
                      <InputGroupInput {...field} aria-invalid={fieldState.invalid} id={field.name} type='text' placeholder={'ACME'} required />
                      <InputGroupAddon>
                        <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path stroke='none' d='M0 0h24v24H0z' fill='none'/><path d='M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0' /><path d='M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2' /></svg>
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
                    <FieldLabel htmlFor={field.name}>Razón social</FieldLabel>
                    <InputGroup>
                      <InputGroupInput {...field} aria-invalid={fieldState.invalid} id={field.name} type='text' placeholder='ACME S.L.' required />
                      <InputGroupAddon>
                        <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path stroke='none' d='M0 0h24v24H0z' fill='none'/><path d='M3 21l18 0' /><path d='M9 8l1 0' /><path d='M9 12l1 0' /><path d='M9 16l1 0' /><path d='M14 8l1 0' /><path d='M14 12l1 0' /><path d='M14 16l1 0' /><path d='M5 21v-16a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v16' /></svg>
                      </InputGroupAddon>
                      <InputGroupAddon align={'inline-end'}>
                        <Tooltip>
                          <TooltipTrigger className='leading-1'>
                            <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4' viewBox='0 0 24 24' fill='currentColor'><path d='M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 15H13V17H11V15ZM13 13.3551V14H11V12.5C11 11.9477 11.4477 11.5 12 11.5C12.8284 11.5 13.5 10.8284 13.5 10C13.5 9.17157 12.8284 8.5 12 8.5C11.2723 8.5 10.6656 9.01823 10.5288 9.70577L8.56731 9.31346C8.88637 7.70919 10.302 6.5 12 6.5C13.933 6.5 15.5 8.067 15.5 10C15.5 11.5855 14.4457 12.9248 13 13.3551Z' /></svg>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className='text-center'>Nombre legal de tu empresa <br /> tal como figura en el registro</p>
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
            <FieldGroup className='flex flex-col gap-4 sm:grid sm:grid-cols-2'>
              <Controller
                name='email'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Correo</FieldLabel>
                    <InputGroup>
                      <InputGroupInput {...field} aria-invalid={fieldState.invalid} id={field.name} type='email' placeholder='m@example.com' required />
                      <InputGroupAddon>
                        <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path stroke='none' d='M0 0h24v24H0z' fill='none'/><path d='M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z' /><path d='M3 7l9 6l9 -6' /></svg>
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
                    <FieldLabel htmlFor={field.name}>Número de teléfono</FieldLabel>
                    <InputGroup>
                      <InputGroupInput {...field} aria-invalid={fieldState.invalid} id={field.name} type='tel' placeholder='654987321' required />
                      <InputGroupAddon>
                        <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path stroke='none' d='M0 0h24v24H0z' fill='none'/><path d='M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2' /></svg>
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
            <FieldGroup className='flex flex-col gap-4 sm:grid sm:grid-cols-2'>
              <Controller
                name='password'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Contraseña</FieldLabel>
                    <InputGroup>
                      <InputGroupInput {...field} aria-invalid={fieldState.invalid} id={field.name} type='password' required />
                      <InputGroupAddon>
                        <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path stroke='none' d='M0 0h24v24H0z' fill='none'/><path d='M12 10v4' /><path d='M10 13l4 -2' /><path d='M10 11l4 2' /><path d='M5 10v4' /><path d='M3 13l4 -2' /><path d='M3 11l4 2' /><path d='M19 10v4' /><path d='M17 13l4 -2' /><path d='M17 11l4 2' /></svg>
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name='passwordRepeat'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Repetir contraseña</FieldLabel>
                    <InputGroup>
                      <InputGroupInput {...field} aria-invalid={fieldState.invalid} id={field.name} type='password' required />
                      <InputGroupAddon>
                        <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path stroke='none' d='M0 0h24v24H0z' fill='none'/><path d='M12 10v4' /><path d='M10 13l4 -2' /><path d='M10 11l4 2' /><path d='M5 10v4' /><path d='M3 13l4 -2' /><path d='M3 11l4 2' /><path d='M19 10v4' /><path d='M17 13l4 -2' /><path d='M17 11l4 2' /></svg>
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
            <FieldGroup className='flex flex-col gap-4 sm:grid sm:grid-cols-2'>
              <Controller
                name='documentValue'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>CIF/NIF</FieldLabel>
                    <InputGroup>
                      <InputGroupInput {...field} aria-invalid={fieldState.invalid} id={field.name} type='text' placeholder='A12345678' required />
                      <InputGroupAddon>
                        <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path stroke='none' d='M0 0h24v24H0z' fill='none'/><path d='M3 4m0 3a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v10a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3z' /><path d='M9 10m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0' /><path d='M15 8l2 0' /><path d='M15 12l2 0' /><path d='M7 16l10 0' /></svg>
                      </InputGroupAddon>
                      <InputGroupAddon align={'inline-end'}>
                        <Tooltip>
                          <TooltipTrigger className='leading-1'>
                            <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4' viewBox='0 0 24 24' fill='currentColor'><path d='M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 15H13V17H11V15ZM13 13.3551V14H11V12.5C11 11.9477 11.4477 11.5 12 11.5C12.8284 11.5 13.5 10.8284 13.5 10C13.5 9.17157 12.8284 8.5 12 8.5C11.2723 8.5 10.6656 9.01823 10.5288 9.70577L8.56731 9.31346C8.88637 7.70919 10.302 6.5 12 6.5C13.933 6.5 15.5 8.067 15.5 10C15.5 11.5855 14.4457 12.9248 13 13.3551Z' /></svg>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className='text-center'>Valor del documento CIF/NIF (número + letras)</p>
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
                name='document'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Documento/Fotocopia CIF/NIF</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        aria-invalid={fieldState.invalid}
                        id={field.name}
                        onChange={(e) => field.onChange(e.target.files)}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        type='file'
                        required
                        className='pt-1.5'
                        accept='image/jpeg,image/png,.pdf'
                        aria-description='Fotocopia que permita visualizar el documento completo'
                      />
                      <InputGroupAddon>
                        <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path stroke='none' d='M0 0h24v24H0z' fill='none'/><path d='M3 4m0 3a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v10a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3z' /><path d='M9 10m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0' /><path d='M15 8l2 0' /><path d='M15 12l2 0' /><path d='M7 16l10 0' /></svg>
                      </InputGroupAddon>
                      <InputGroupAddon align={'inline-end'}>
                        <Tooltip>
                          <TooltipTrigger className='leading-1'>
                            <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4' viewBox='0 0 24 24' fill='currentColor'><path d='M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 15H13V17H11V15ZM13 13.3551V14H11V12.5C11 11.9477 11.4477 11.5 12 11.5C12.8284 11.5 13.5 10.8284 13.5 10C13.5 9.17157 12.8284 8.5 12 8.5C11.2723 8.5 10.6656 9.01823 10.5288 9.70577L8.56731 9.31346C8.88637 7.70919 10.302 6.5 12 6.5C13.933 6.5 15.5 8.067 15.5 10C15.5 11.5855 14.4457 12.9248 13 13.3551Z' /></svg>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className='text-center'>Fotocopia que permita visualizar el documento CIF/NIF completo</p>
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
            <FieldGroup>
              <Field>
                <Button type='submit' className='hover:cursor-pointer'>Regístrate</Button>
                <FieldSeparator />
                <FieldDescription className='text-center'>
                  ¿Ya tienes cuenta?{' '}
                  <a href='/login' className='underline underline-offset-4'>
                    Inicia sesión
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

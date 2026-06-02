import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field'
import { Form } from '@/components/ui/form'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { AuthContext } from '@/contexts/auth.context.ts'
import { createInvestor } from '@/services/investor.api.ts'
import { InvestorType, type Investor } from '@/types/User'
import { zodResolver } from '@hookform/resolvers/zod'
import Cookies from 'js-cookie'
import {
  BuildingIcon,
  CircleQuestionMarkIcon,
  EllipsisIcon,
  IdCardIcon,
  MailIcon,
  PhoneIcon,
  UserIcon,
  UsersIcon
} from 'lucide-react'
import { useContext, useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { z } from 'zod'

const formSchema = z.object({
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
  taxId: z.string()
    .min(1, 'El CIF/NIF es obligatorio'),
  document: z.custom<FileList>()
    .refine((files) => files && files.length > 0, 'El documento es obligatorio')
    .refine((files) => files?.[0]?.size > 0, 'El documento no puede estar vacío'),
  investorType: z.enum(InvestorType)
}).refine((data) => data.password === data.passwordRepeat, {
  message: 'Las contraseñas no coinciden',
  path: ['passwordRepeat']
})

export default function InvestorForm ({ investorType }: { investorType: InvestorType }) {
  const navigate = useNavigate()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      companyName: '',
      email: '',
      phoneNumber: '',
      password: '',
      passwordRepeat: '',
      taxId: '',
      document: undefined,
      investorType: investorType
    }
  })

  const watchedName = useWatch({
    control: form.control,
    name: 'name'
  })

  useEffect(() => {
    if (investorType === InvestorType.INDIVIDUAL && watchedName && watchedName !== form.getValues('companyName')) {
      form.setValue('companyName', watchedName, { shouldValidate: false })
    }
  }, [watchedName, investorType, form])

  const authContext = useContext(AuthContext)
  if (!authContext) {
    throw new Error('AuthContext must be used within AuthProvider')
  }
  const { setLoggedInUser } = authContext
  function onSubmit (data: z.infer<typeof formSchema>) {
    const formData = new FormData()

    formData.append('investorType', data.investorType)
    formData.append('name', data.name)
    formData.append('companyName', data.companyName)
    formData.append('email', data.email)
    formData.append('phoneNumber', data.phoneNumber)
    formData.append('password', data.password)
    formData.append('passwordRepeat', data.passwordRepeat)
    formData.append('taxId', data.taxId)
    formData.append('document', data.document[0])

    createInvestor(formData, (res) => {
      Cookies.set('logged-in-user', JSON.stringify(res.data), { expires: 1 })
      setLoggedInUser(res.data as Investor)

      navigate('/')
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{
          investorType === InvestorType.COMPANY
            ? 'Empresa'
            : 'Particular'}
        </CardTitle>
        <CardDescription>{
          investorType === InvestorType.COMPANY
            ? 'Subasta, invierte e intercambia facturas con otras empresas e inversores.'
            : 'Invierte en facturas comerciales y accede a oportunidades de inversión únicas.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4'>
            <FieldGroup className='flex flex-col gap-4 sm:grid sm:grid-cols-2'>
              <Controller
                name='investorType'
                control={form.control}
                render={({ field }) => (
                  <Field className='hidden'>
                    <FieldLabel htmlFor={field.name}>Tipo de empresa</FieldLabel>
                    <InputGroup>
                      <InputGroupInput {...field} id={field.name} required value={investorType ?? ''} />
                    </InputGroup>
                  </Field>
                )}
              />
              <Controller
                name='name'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>{
                      investorType === InvestorType.COMPANY
                        ? 'Nombre de la empresa'
                        : 'Nombre completo'}
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupInput {...field} aria-invalid={fieldState.invalid} id={field.name} type='text' placeholder={'ACME'} required />
                      <InputGroupAddon>{
                        investorType === InvestorType.COMPANY
                          ? <UsersIcon />
                          : <UserIcon />}
                      </InputGroupAddon>
                      {investorType === InvestorType.INDIVIDUAL && (
                        <InputGroupAddon align={'inline-end'}>
                          <Tooltip>
                            <TooltipTrigger className='leading-1'>
                              <CircleQuestionMarkIcon className='w-4 h-4'/>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className='text-center'>Nombre y apellidos según <br /> documento de identificación</p>
                            </TooltipContent>
                          </Tooltip>
                        </InputGroupAddon>
                      )}
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              {investorType !== InvestorType.INDIVIDUAL && (
                <Controller
                  name='companyName'
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Razón social</FieldLabel>
                      <InputGroup>
                        <InputGroupInput {...field} aria-invalid={fieldState.invalid} id={field.name} type='text' placeholder='ACME S.L.' required />
                        <InputGroupAddon>
                          <BuildingIcon />
                        </InputGroupAddon>
                        <InputGroupAddon align={'inline-end'}>
                          <Tooltip>
                            <TooltipTrigger className='leading-1'>
                              <CircleQuestionMarkIcon className='w-4 h-4'/>
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
              )}
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
                    <FieldLabel htmlFor={field.name}>Número de teléfono</FieldLabel>
                    <InputGroup>
                      <InputGroupInput {...field} aria-invalid={fieldState.invalid} id={field.name} type='tel' placeholder='654987321' required />
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
                        <EllipsisIcon />
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
                        <EllipsisIcon />
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
                name='taxId'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>CIF/NIF</FieldLabel>
                    <InputGroup>
                      <InputGroupInput {...field} aria-invalid={fieldState.invalid} id={field.name} type='text' placeholder='A12345678' required />
                      <InputGroupAddon>
                        <IdCardIcon/>
                      </InputGroupAddon>
                      <InputGroupAddon align={'inline-end'}>
                        <Tooltip>
                          <TooltipTrigger className='leading-1'>
                            <CircleQuestionMarkIcon className='w-4 h-4'/>
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
                        accept='image/jpg,image/jpeg,image/png,.pdf'
                        aria-description='Fotocopia que permita visualizar el documento completo'
                      />
                      <InputGroupAddon>
                        <IdCardIcon/>
                      </InputGroupAddon>
                      <InputGroupAddon align={'inline-end'}>
                        <Tooltip>
                          <TooltipTrigger className='leading-1'>
                            <CircleQuestionMarkIcon className='w-4 h-4'/>
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
                  <Link to='/login' className='underline underline-offset-4'>
                    Inicia sesión
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

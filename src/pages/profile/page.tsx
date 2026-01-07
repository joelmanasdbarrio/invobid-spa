import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog.tsx'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field'
import { Form } from '@/components/ui/form'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { AuthContext } from '@/contexts/auth.context'
import { useLogout } from '@/hooks/use-logout'
import { updateAdminById } from '@/services/admin.api'
import { deleteInvestorById, updateInvestorById } from '@/services/investor.api'
import { type Investor, InvestorStatus, InvestorType, type User, UserType } from '@/types/User'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertDialogCancel, AlertDialogTitle } from '@radix-ui/react-alert-dialog'
import {
  AlertCircleIcon,
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
import { z } from 'zod'

const formSchemaAdmin = z.object({
  email: z.email('Correo electrónico no válido'),
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .optional()
    .or(z.literal('')),
  passwordRepeat: z.string()
    .min(6, 'La repetición de la contraseña debe tener al menos 6 caracteres')
    .optional()
    .or(z.literal(''))
}).refine((data) => {
  if (data.password || data.passwordRepeat) {
    return data.password === data.passwordRepeat
  }
  return true
}, {
  message: 'Las contraseñas no coinciden',
  path: ['passwordRepeat']
})

const formSchemaInvestor = z.object({
  email: z.email('Correo electrónico no válido'),
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  companyName: z.string()
    .min(1, 'La razón social es obligatoria'),
  phoneNumber: z.string()
    .min(6, 'El número de teléfono es obligatorio'),
  isOptedInNotificationsEmail: z.boolean(),
  isOptedInNotificationsSMS: z.boolean(),
  documentValue: z.string()
    .min(1, 'El CIF/NIF es obligatorio'),
  document: z.custom<FileList>()
    .refine((files) => files && files.length > 0, 'El documento es obligatorio')
    .refine((files) => files?.[0]?.size > 0, 'El documento no puede estar vacío')
    .transform((files) => files[0]).optional(),
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .optional()
    .or(z.literal('')),
  passwordRepeat: z.string()
    .min(6, 'La repetición de la contraseña debe tener al menos 6 caracteres')
    .optional()
    .or(z.literal(''))
}).refine((data) => {
  if (data.password || data.passwordRepeat) {
    return data.password === data.passwordRepeat
  }
  return true
}, {
  message: 'Las contraseñas no coinciden',
  path: ['passwordRepeat']
})

type AdminFormType = z.infer<typeof formSchemaAdmin>
type InvestorFormType = z.infer<typeof formSchemaInvestor>

function getFormConfig (loggedInUser: User | null) {
  if (loggedInUser?.type === UserType.INVESTOR) {
    return {
      schema: formSchemaInvestor,
      defaultValues: {
        email: loggedInUser?.email || '',
        name: loggedInUser?.name || '',
        companyName: (loggedInUser as Investor).companyName || '',
        phoneNumber: (loggedInUser as Investor).phoneNumber || '',
        isOptedInNotificationsEmail: (loggedInUser as Investor).isOptedInNotificationsEmail || false,
        isOptedInNotificationsSMS: (loggedInUser as Investor).isOptedInNotificationsSMS || false,
        documentValue: '',
        document: undefined,
        password: '',
        passwordRepeat: ''
      } as InvestorFormType
    }
  }
  return {
    schema: formSchemaAdmin,
    defaultValues: {
      email: loggedInUser?.email || '',
      name: loggedInUser?.name || '',
      password: '',
      passwordRepeat: ''
    } as AdminFormType
  }
}

export default function ProfilePage () {
  const authContext = useContext(AuthContext)
  if (!authContext) {
    throw new Error('AuthContext must be used within AuthProvider')
  }
  const { loggedInUser } = authContext

  const isFormDisabled =
    loggedInUser?.type === UserType.INVESTOR &&
    (
      (loggedInUser as Investor)?.status === InvestorStatus.PENDING ||
        (loggedInUser as Investor)?.status === InvestorStatus.DENIED
    )

  const { schema: formSchema, defaultValues: formDefaults } = getFormConfig(loggedInUser)

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: formDefaults
  })

  const name = useWatch({ control: form.control, name: 'name' })
  useEffect(() => {
    if (loggedInUser?.type === UserType.INVESTOR && (loggedInUser as Investor)?.investorType === InvestorType.INDIVIDUAL) {
      form.setValue('companyName', name, { shouldValidate: false })
    }
  }, [name, loggedInUser, form])

  useEffect(() => {
    const { defaultValues } = getFormConfig(loggedInUser)
    form.reset(defaultValues)
  }, [loggedInUser, form])

  function onSubmit (data: AdminFormType | InvestorFormType) {
    const formData = new FormData()

    formData.append('email', data.email)
    formData.append('name', data.name)
    if (data.password) formData.append('password', data.password)
    if (data.passwordRepeat) formData.append('passwordRepeat', data.passwordRepeat)

    if (loggedInUser?.type === UserType.INVESTOR) {
      const investorData = data as InvestorFormType
      const companyName = investorData.companyName || form.getValues('companyName') || ''
      formData.append('companyName', companyName)
      formData.append('phoneNumber', investorData.phoneNumber)
      formData.append('isOptedInNotificationsEmail', String(investorData.isOptedInNotificationsEmail))
      formData.append('isOptedInNotificationsSMS', String(investorData.isOptedInNotificationsSMS))
      if (investorData.document && investorData.documentValue) {
        formData.append('documentValue', investorData.documentValue)
        formData.append('document', investorData.document)
      }

      updateInvestorById(loggedInUser!.id, formData)
    } else if (loggedInUser?.type === UserType.ADMIN) {
      updateAdminById(loggedInUser!.id, JSON.stringify({
        email: data.email,
        name: data.name,
        password: data.password || undefined,
        passwordRepeat: data.passwordRepeat || undefined
      }))
    }
  }

  const logout = useLogout()
  function disableAccount () {
    deleteInvestorById(loggedInUser!.id).then(() => {
      logout()
    })
  }

  return (
    <section className='flex flex-col gap-4'>
      <h3 className='text-lg'>Actualiza tus datos de usuario</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4'>
          <FieldGroup className='grid grid-cols-1 xl:grid-cols-2'>
            <Controller
              name='email'
              control={form.control}
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
            {loggedInUser?.type === UserType.INVESTOR && (
              <Controller
                name='phoneNumber'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Número de teléfono:</FieldLabel>
                    <InputGroup>
                      <InputGroupInput {...field} id={field.name} type='tel' disabled={isFormDisabled} />
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
            )}
            <Controller
              name='name'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>{
                    loggedInUser?.type === UserType.INVESTOR && (loggedInUser as Investor)?.investorType === InvestorType.COMPANY
                      ? 'Nombre de la empresa:'
                      : 'Nombre completo:'}
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput {...field} aria-invalid={fieldState.invalid} id={field.name} type='text' placeholder={'ACME'} required disabled={isFormDisabled} />
                    <InputGroupAddon>{
                      loggedInUser?.type === UserType.INVESTOR && (loggedInUser as Investor)?.investorType === InvestorType.COMPANY
                        ? <UsersIcon />
                        : <UserIcon />}
                    </InputGroupAddon>
                    {loggedInUser?.type === UserType.INVESTOR && (loggedInUser as Investor)?.investorType === InvestorType.INDIVIDUAL && (
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
            {loggedInUser?.type === UserType.INVESTOR && (
              <>
                <Controller
                  name='companyName'
                  control={form.control}
                  disabled={loggedInUser?.type === UserType.INVESTOR && (loggedInUser as Investor)?.investorType === InvestorType.INDIVIDUAL}
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
                <Controller
                  name='isOptedInNotificationsEmail'
                  control={form.control}
                  render={({field}) => (
                    <Label className='hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-aria-checked:border-primary/75 has-aria-checked:bg-primary/10 dark:has-aria-checked:border-primary/50 dark:has-aria-checked:bg-primary/20'>
                      <Checkbox
                        id='toggle-email-notifications'
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className='data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700'
                        disabled={isFormDisabled}
                      />
                      <div className='grid gap-1.5 font-normal'>
                        <p className='text-sm leading-none font-medium'>
                          Recibir notificaciones por correo electrónico
                        </p>
                        <p className='text-muted-foreground text-sm'>
                          Notificaciones...
                        </p>
                      </div>
                    </Label>
                  )}
                />
                <Controller
                  name='isOptedInNotificationsSMS'
                  control={form.control}
                  render={({field}) => (
                    <Label className='hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-aria-checked:border-primary/75 has-aria-checked:bg-primary/10 dark:has-aria-checked:border-primary/50 dark:has-aria-checked:bg-primary/20'>
                      <Checkbox
                        id='toggle-sms-notifications'
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className='data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700'
                        disabled={isFormDisabled}
                      />
                      <div className='grid gap-1.5 font-normal'>
                        <p className='text-sm leading-none font-medium'>
                          Recibir notificaciones por SMS
                        </p>
                        <p className='text-muted-foreground text-sm'>
                          Notificaciones...
                        </p>
                      </div>
                    </Label>
                  )}
                />
              </>
            )}
          </FieldGroup>
          <FieldSeparator className='col-span-full' />
          <h4 className='text-md col-span-full font-bold'>Cambiar contraseña</h4>
          <FieldGroup className='grid grid-cols-1 xl:grid-cols-2'>
            <Controller
              name='password'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Nueva contraseña:</FieldLabel>
                  <InputGroup>
                    <InputGroupInput {...field} id={field.name} type='password' autoComplete='off' disabled={isFormDisabled} />
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
                  <FieldLabel htmlFor={field.name}>Repetir nueva contraseña:</FieldLabel>
                  <InputGroup>
                    <InputGroupInput {...field} id={field.name} type='password' disabled={isFormDisabled} />
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
          {
            loggedInUser?.type === UserType.INVESTOR && (
              <>
                <FieldSeparator className='col-span-full' />
                <h4 className='text-md col-span-full font-bold'>Documento de identidad</h4>
                {
                  (loggedInUser as Investor)?.status === InvestorStatus.VERIFIED && (
                    <Alert variant='destructive'>
                      <AlertCircleIcon />
                      <AlertTitle>
                        Antes de actualizar su documento
                      </AlertTitle>
                      <AlertDescription>
                        Modificar su documento de identidad requerirá una nueva verificación por parte de nuestro equipo. Durante este proceso, su cuenta puede estar temporalmente limitada.
                      </AlertDescription>
                    </Alert>
                  )
                }
                <FieldGroup className='grid grid-cols-1 xl:grid-cols-2'>
                  <Controller
                    name='documentValue'
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>CIF/NIF:</FieldLabel>
                        <InputGroup>
                          <InputGroupInput {...field} aria-invalid={fieldState.invalid} id={field.name} type='text' placeholder='A12345678' disabled={isFormDisabled} />
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
                        <FieldLabel htmlFor={field.name}>Documento/Fotocopia CIF/NIF:</FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            aria-invalid={fieldState.invalid}
                            id={field.name}
                            onChange={(e) => field.onChange(e.target.files)}
                            onBlur={field.onBlur}
                            ref={field.ref}
                            type='file'
                            className='pt-1.5'
                            accept='image/jpg,image/jpeg,image/png,.pdf'
                            aria-description='Fotocopia que permita visualizar el documento completo'
                            disabled={isFormDisabled}
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
              </>
            )
          }
          <FieldGroup className='flex flex-row gap-2 justify-end items-end'>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant='destructive' type='button'>Cerrar cuenta</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Deseas cerrar tu cuenta?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción es irreversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel asChild>
                    <Button variant='outline'>Cancelar</Button>
                  </AlertDialogCancel>
                  <Button variant='destructive' type='button' onClick={disableAccount} disabled={isFormDisabled}>Aceptar</Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button type='submit' disabled={isFormDisabled}>Guardar</Button>
          </FieldGroup>
        </form>
      </Form>

      {
        loggedInUser?.type === UserType.INVESTOR && (loggedInUser as Investor)?.status === InvestorStatus.PENDING && (
          <AlertDialog defaultOpen>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cuenta en revisión</AlertDialogTitle>
                <AlertDialogDescription>
                  Su cuenta se encuentra actualmente en estado de revisión.
                  Nuestro equipo está evaluando la información proporcionada y se pondrá en contacto con usted si se requiere alguna acción adicional.
                  Hasta entonces, no podrá actualizar los datos de su cuenta.
                  Gracias por su paciencia.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction>Aceptar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )
      }
    </section>
  )
}

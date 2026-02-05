import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog.tsx'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field'
import { Form } from '@/components/ui/form'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { AuthContext } from '@/contexts/auth.context'
import { useLogout } from '@/hooks/use-logout'
import { deleteInvestorById, updateInvestorById } from '@/services/investor.api'
import { type Investor, InvestorStatus, InvestorType, UserType } from '@/types/User'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertDialogCancel, AlertDialogTitle } from '@radix-ui/react-alert-dialog'
import {
  CircleQuestionMarkIcon,
  EllipsisIcon,
  IdCardIcon,
  MailIcon,
  PhoneIcon,
  RefreshCcwIcon,
  SaveIcon,
  UploadIcon,
  UserIcon,
  UsersIcon
} from 'lucide-react'
import { useCallback, useContext, useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

const validateFormSchema = z.object({
  status: z.enum(InvestorStatus)
})

const baseFormSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  companyName: z.string()
    .min(1, 'La razón social es obligatoria'),
  email: z.email('Correo electrónico no válido'),
  phoneNumber: z.string()
    .min(6, 'El número de teléfono es obligatorio')
})

const passwordFormSchema = z.object({
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

const notificationFormSchema = z.object({
  isOptedInNotificationsEmail: z.boolean(),
  isOptedInNotificationsSMS: z.boolean()
})

const documentFormSchema = z.object({
  taxId: z.string('El CIF/NIF es obligatorio')
    .min(7, 'El NIF/CIF debe tener al menos 7 caracteres'),
  document: z.custom<FileList>()
    .refine((files) => files && files.length > 0, 'El documento es obligatorio')
    .refine((files) => files?.[0]?.size > 0, 'El documento no puede estar vacío')
    .transform((files) => files[0]).optional()
})

export default function InvestorProfileForm ({ user }: { user: Investor }) {
  const authContext = useContext(AuthContext)
  if (!authContext) {
    throw new Error('AuthContext must be used within AuthProvider')
  }
  const { setLoggedInUser } = authContext

  const isFormDisabled = user.status === InvestorStatus.PENDING || user.status === InvestorStatus.DENIED

  const validateForm = useForm<z.infer<typeof validateFormSchema>>({
    resolver: zodResolver(validateFormSchema),
    mode: 'onTouched',
    defaultValues: {
      status: user.status
    }
  })

  const baseForm = useForm<z.infer<typeof baseFormSchema>>({
    resolver: zodResolver(baseFormSchema),
    mode: 'onTouched',
    defaultValues: {
      name: user.name,
      companyName: user.companyName,
      email: user.email,
      phoneNumber: user.phoneNumber
    }
  })

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    mode: 'onTouched',
    defaultValues: {
      password: '',
      passwordRepeat: ''
    }
  })

  const notificationForm = useForm<z.infer<typeof notificationFormSchema>>({
    resolver: zodResolver(notificationFormSchema),
    mode: 'onTouched',
    defaultValues: {
      isOptedInNotificationsEmail: user.isOptedInNotificationsEmail,
      isOptedInNotificationsSMS: user.isOptedInNotificationsSMS
    }
  })

  const documentForm = useForm<z.infer<typeof documentFormSchema>>({
    resolver: zodResolver(documentFormSchema),
    mode: 'onTouched',
    defaultValues: {
      taxId: '',
      document: undefined
    }
  })

  const name = useWatch({ control: baseForm.control, name: 'name' })
  useEffect(() => {
    if (user.investorType === InvestorType.INDIVIDUAL) {
      baseForm.setValue('companyName', name, { shouldValidate: false })
    }
  }, [name, user, baseForm])
  const companyName = useWatch({ control: baseForm.control, name: 'companyName' })
  const email = useWatch({ control: baseForm.control, name: 'email' })
  const phoneNumber = useWatch({ control: baseForm.control, name: 'phoneNumber' })
  const document = useWatch({ control: documentForm.control, name: 'document' })
  const taxId = useWatch({ control: documentForm.control, name: 'taxId' })

  function onSubmitBase (data: z.infer<typeof baseFormSchema>) {
    const companyName = data.companyName || data.name
    updateInvestorById(user.id, JSON.stringify({
      name: data.name,
      companyName,
      email: data.email,
      phoneNumber: data.phoneNumber
    })).then(res => setLoggedInUser(res.data))
  }

  function onSubmitPassword (data: z.infer<typeof passwordFormSchema>) {
    updateInvestorById(user.id, JSON.stringify({
      ...(data.password && { password: data.password }),
      ...(data.passwordRepeat && { passwordRepeat: data.passwordRepeat })
    })).then(res => setLoggedInUser(res.data))
  }

  const onSubmitNotification = useCallback((data: z.infer<typeof notificationFormSchema>) => {
    updateInvestorById(user.id, JSON.stringify({
      isOptedInNotificationsEmail: data.isOptedInNotificationsEmail,
      isOptedInNotificationsSMS: data.isOptedInNotificationsSMS
    })).then(res => setLoggedInUser(res.data))
  }, [user.id, setLoggedInUser])

  const notificationEmail = useWatch({ control: notificationForm.control, name: 'isOptedInNotificationsEmail' })
  const notificationSMS = useWatch({ control: notificationForm.control, name: 'isOptedInNotificationsSMS' })

  useEffect(() => {
    if (
      !(notificationEmail === user.isOptedInNotificationsEmail &&
      notificationSMS === user.isOptedInNotificationsSMS)
    ) {
      onSubmitNotification({
        isOptedInNotificationsEmail: notificationEmail,
        isOptedInNotificationsSMS: notificationSMS
      })
    }
  }, [onSubmitNotification, notificationEmail, notificationSMS, user.isOptedInNotificationsEmail, user.isOptedInNotificationsSMS])

  function onSubmitDocument (data: z.infer<typeof documentFormSchema>) {
    const documentFormData = new FormData()
    documentFormData.append('taxId', data.taxId)
    documentFormData.append('document', data.document)
    updateInvestorById(user.id, documentFormData).then(res => setLoggedInUser(res.data))
  }

  function onSubmitValidate (data: z.infer<typeof validateFormSchema>) {
    updateInvestorById(user.id, JSON.stringify({
      status: data.status
    })).then(res => setLoggedInUser(res.data))
  }

  const logout = useLogout()
  function disableAccount () {
    deleteInvestorById(user!.id).then(() => {
      logout()
    })
  }

  return (
    <>
      <Form {...validateForm}>
        <form onSubmit={validateForm.handleSubmit(onSubmitValidate)} className='flex md:justify-end'>
          {(user.status === InvestorStatus.CORRECTION || user.status === InvestorStatus.PENDING) && (
            <Button
              variant='outline'
              className='group md:w-10 md:hover:w-full md:max-w-min md:gap-0 md:hover:gap-2 duration-300'
              disabled={user.status === InvestorStatus.PENDING || isFormDisabled}
              onClick={() => {
                validateForm.setValue('status', InvestorStatus.PENDING)
                validateForm.handleSubmit(onSubmitValidate)()
              }}
            >
              <RefreshCcwIcon className='transition-all group-hover:rotate-180 duration-300' />
              <span className='overflow-hidden'>
                Solicitar verificación
              </span>
            </Button>
          )}
        </form>
      </Form>
      <FieldSeparator className='md:hidden col-span-full' />
      <Form {...baseForm}>
        <form onSubmit={baseForm.handleSubmit(onSubmitBase)} className='col-span-full flex flex-col gap-4'>
          <FieldGroup className='grid grid-cols-1 lg:grid-cols-[1fr_1fr_minmax(10px,40px)]'>
            <Controller
              name='name'
              control={baseForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>{
                    user?.type === UserType.INVESTOR && user.investorType === InvestorType.COMPANY
                      ? 'Nombre de la empresa:'
                      : 'Nombre completo:'}
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput {...field} aria-invalid={fieldState.invalid} id={field.name} type='text' placeholder={'ACME'} required disabled={user.status === InvestorStatus.VERIFIED || isFormDisabled} />
                    <InputGroupAddon>{
                      user?.type === UserType.INVESTOR && user.investorType === InvestorType.COMPANY
                        ? <UsersIcon />
                        : <UserIcon />}
                    </InputGroupAddon>
                    {user?.type === UserType.INVESTOR && user.investorType === InvestorType.INDIVIDUAL && (
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
            {user.investorType !== InvestorType.INDIVIDUAL && (
              <Controller
                name='companyName'
                control={baseForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Razón social:</FieldLabel>
                    <InputGroup>
                      <InputGroupInput {...field} id={field.name} type='text' disabled={user.status === InvestorStatus.VERIFIED || isFormDisabled || user.investorType === InvestorType.INDIVIDUAL} />
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
            )}
            <Controller
              name='email'
              control={baseForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className='col-start-1'>
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
            <Button
              className='w-min self-end justify-self-end'
              disabled={
                (
                  name === user.name &&
                  companyName === user.companyName &&
                  email === user.email &&
                  phoneNumber === user.phoneNumber
                ) ||
                isFormDisabled
              }
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
      <Form {...passwordForm}>
        <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className='col-span-full flex flex-col gap-4'>
          <h4 className='text-md col-span-full font-bold'>Cambiar contraseña</h4>
          <FieldGroup className='grid grid-cols-1 lg:grid-cols-[1fr_1fr_minmax(10px,40px)]'>
            <Controller
              name='password'
              control={passwordForm.control}
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
              control={passwordForm.control}
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
            <Button
              className='w-min self-end justify-self-end'
              disabled={!(passwordForm.getValues('password')) || !(passwordForm.getValues('passwordRepeat')) || isFormDisabled}
              title='Actualizar contraseña'
            >
              <SaveIcon />
              <span className='lg:hidden'>
                Actualizar contraseña
              </span>
            </Button>
          </FieldGroup>
        </form>
      </Form>
      <FieldSeparator className='col-span-full' />
      <Form {...notificationForm}>
        <form onSubmit={notificationForm.handleSubmit(onSubmitNotification)} className='col-span-full flex flex-col gap-4'>
          <h4 className='text-md col-span-full font-bold'>Notificaciones</h4>
          <FieldGroup className='grid grid-cols-1 lg:grid-cols-[1fr_1fr_minmax(10px,40px)]'>
            <Controller
              name='isOptedInNotificationsEmail'
              control={notificationForm.control}
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
              control={notificationForm.control}
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
          </FieldGroup>
        </form>
      </Form>
      {(user.status !== InvestorStatus.VERIFIED && user.status !== InvestorStatus.DENIED) && (
        <>
          <FieldSeparator className='col-span-full' />
          <Form {...documentForm}>
            <form onSubmit={documentForm.handleSubmit(onSubmitDocument)} className='col-span-full flex flex-col gap-4'>
              <h4 className='text-md col-span-full font-bold'>Documento de identidad</h4>
              <FieldGroup className='grid grid-cols-1 lg:grid-cols-[1fr_1fr_minmax(10px,40px)]'>
                <Controller
                  name='taxId'
                  control={documentForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>CIF/NIF:</FieldLabel>
                      <InputGroup>
                        <InputGroupInput {...field} aria-invalid={fieldState.invalid} id={field.name} type='text' placeholder='A12345678' disabled={user.status === InvestorStatus.VERIFIED || isFormDisabled} />
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
                  control={documentForm.control}
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
                          disabled={user.status === InvestorStatus.VERIFIED || isFormDisabled}
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
                <Button
                  className='w-min self-end justify-self-end'
                  disabled={(!document || taxId === '' ) || isFormDisabled}
                  title='Subir documento'
                >
                  <UploadIcon />
                  <span className='lg:hidden'>
                    Subir documento
                  </span>
                </Button>
              </FieldGroup>
            </form>
          </Form>
        </>
      )}
      <div className='col-span-full flex justify-end'>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant='destructive' type='button'>Desactivar cuenta</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Deseas desactivar tu cuenta?</AlertDialogTitle>
              <AlertDialogDescription>
                Desactivar tu cuenta <b>NO</b> eliminará tus datos de nuestra plataforma,
                seguirán siendo accesibles por:
                <ul className='list-disc list-inside my-2'>
                  <li>Administradores y personal autorizado, a través del portal de soporte y administración.</li>
                  <li>Otros usuarios de la plataforma que hayan interactuado contigo en subastas/facturas, a través de sus datos históricos.</li>
                  <li>Administraciones públicas y autoridades competentes, en cumplimiento de obligaciones legales y regulatorias.</li>
                </ul>
                Lo que <b>SÍ</b> va a ocurrir si decides desactivar tu cuenta:
                <ul className='list-disc list-inside my-2'>
                  <li>No recibirás más comunicaciones ni notificaciones de nuestra parte.</li>
                  <li>Tu perfil y datos asociados dejarán de ser visibles para nuevos usuarios.</li>
                  <li>Se desactivarán tus subastas y se ocultarán tus facturas en nuevas búsquedas.</li>
                </ul>
                Podrás volver a activarla iniciando sesión nuevamente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button variant='outline'>Cancelar</Button>
              </AlertDialogCancel>
              <Button variant='destructive' type='button' onClick={disableAccount}>Aceptar</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {
        user.status === InvestorStatus.PENDING && (
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
    </>
  )
}

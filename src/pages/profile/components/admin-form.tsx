import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog.tsx'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Form } from '@/components/ui/form'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { AuthContext } from '@/contexts/auth.context'
import { useLogout } from '@/hooks/use-logout'
import { deleteAdminById, updateAdminById } from '@/services/admin.api'
import { type Admin, type Investor, InvestorType, UserType } from '@/types/User'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertDialogCancel, AlertDialogTitle } from '@radix-ui/react-alert-dialog'
import { CircleQuestionMarkIcon, EllipsisIcon, MailIcon, UserIcon, UsersIcon } from 'lucide-react'
import { use } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

const formSchema = z.object({
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

export default function AdminProfileForm ({ user }: { user: Admin }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: {
      email: user.email,
      name: user.name,
      password: '',
      passwordRepeat: ''
    }
  })

  const authContext = use(AuthContext)
  if (!authContext) {
    throw new Error('AuthContext must be used within AuthProvider')
  }
  const { setLoggedInUser } = authContext

  function onSubmit (data: z.infer<typeof formSchema>) {
    updateAdminById(user!.id, JSON.stringify({
      email: data.email,
      name: data.name,
      password: data.password || undefined,
      passwordRepeat: data.passwordRepeat || undefined
    })).then(res => setLoggedInUser(res.data))
  }

  const logout = useLogout()
  function disableAccount () {
    deleteAdminById(user!.id).then(() => {
      logout()
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='col-span-full flex flex-col gap-4'>
        <FieldSet>
          <FieldLegend>Información de contacto</FieldLegend>
          <FieldGroup className='grid grid-cols-1 xl:grid-cols-2'>
            <Controller
              name='email'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Correo electrónico:</FieldLabel>
                  <InputGroup>
                    <InputGroupInput {...field} id={field.name} type='email' />
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
              name='name'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>{
                    user?.type === UserType.INVESTOR && (user as Investor)?.investorType === InvestorType.COMPANY
                      ? 'Nombre de la empresa:'
                      : 'Nombre completo:'}
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput {...field} aria-invalid={fieldState.invalid} id={field.name} type='text' placeholder={'ACME'} required />
                    <InputGroupAddon>{
                      user?.type === UserType.INVESTOR && (user as Investor)?.investorType === InvestorType.COMPANY
                        ? <UsersIcon />
                        : <UserIcon />}
                    </InputGroupAddon>
                    {user?.type === UserType.INVESTOR && (user as Investor)?.investorType === InvestorType.INDIVIDUAL && (
                      <InputGroupAddon align={'inline-end'}>
                        <Tooltip>
                          <TooltipTrigger className='leading-1'>
                            <CircleQuestionMarkIcon className='size-4'/>
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
          </FieldGroup>
        </FieldSet>
        <FieldSet>
          <FieldLegend>Cambiar contraseña</FieldLegend>
          <FieldGroup className='grid grid-cols-1 xl:grid-cols-2'>
            <Controller
              name='password'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Nueva contraseña:</FieldLabel>
                  <InputGroup>
                    <InputGroupInput {...field} id={field.name} type='password' autoComplete='off' />
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
                    <InputGroupInput {...field} id={field.name} type='password' />
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
        </FieldSet>
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
                <Button variant='destructive' type='button' onClick={disableAccount}>Aceptar</Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button type='submit' >Guardar</Button>
        </FieldGroup>
      </form>
    </Form>
  )
}

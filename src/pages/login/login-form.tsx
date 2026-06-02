import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox.tsx'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field'
import { Form } from '@/components/ui/form'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { AuthContext } from '@/contexts/auth.context'
import { login } from '@/services/auth.api'
import { zodResolver } from '@hookform/resolvers/zod'
import Cookies from 'js-cookie'
import { EllipsisIcon, MailIcon } from 'lucide-react'
import { use, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { z } from 'zod'

const formSchema = z.object({
  email: z.email(),
  password: z.string(),
  rememberMe: z.boolean(),
  activateAccount: z.boolean().optional()
})

export default function LoginForm () {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
      activateAccount: false
    }
  })

  const authContext = use(AuthContext)
  if (!authContext) {
    throw new Error('AuthContext must be used within AuthProvider')
  }

  const [isAccountDisabledDialogOpen, setIsAccountDisabledDialogOpen] = useState(false)
  const { setLoggedInUser } = authContext
  const navigate = useNavigate()
  function onSubmit (formData: z.infer<typeof formSchema>) {
    const body = JSON.stringify(formData)
    login(
      body,
      (res) => {
        Cookies.set('logged-in-user', JSON.stringify(res.data), { expires: formData.rememberMe ? 30 : 1 })
        setLoggedInUser(res.data)

        return navigate('/')
      },
      () => {},
      formData.activateAccount).catch(err => {
      if(err?.statusCode === 423) {
        setIsAccountDisabledDialogOpen(true)
      }
    })
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>¡Bienvenido de vuelta!</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4'>
              <FieldGroup>
                <Controller
                  name='email'
                  control={form.control}
                  render={({ field, fieldState}) => (
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
                  name='password'
                  control={form.control}
                  render={({field, fieldState})=> (
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
              </FieldGroup>
              <FieldGroup className='flex flex-row justify-between'>
                <Controller
                  name='rememberMe'
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className='flex flex-row gap-2 items-end w-min'>
                      <FieldLabel htmlFor={field.name}>Recuérdame</FieldLabel>
                      <Checkbox
                        id={field.name}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className='w-4! h-4!'
                      />
                    </Field>
                  )}
                />
                <span
                  className='ml-auto text-sm underline-offset-4 cursor-not-allowed text-muted-foreground'
                >
                  ¿Has olvidado tu contraseña?
                </span>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <Button type='submit' className='hover:cursor-pointer'>Iniciar sesión</Button>
                  <FieldSeparator />
                  <FieldDescription className='text-center'>
                    ¿No tienes cuenta?{' '}
                    <Link to='/register' className='underline underline-offset-4'>
                      Regístrate
                    </Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </Form>
        </CardContent>
      </Card>

      <AlertDialog open={isAccountDisabledDialogOpen} onOpenChange={setIsAccountDisabledDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cuenta deshabilitada</AlertDialogTitle>
            <AlertDialogDescription>
              Su cuenta ha sido deshabilitada. Haga clic en el botón &quot;Aceptar&quot; para habilitarla de nuevo:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => onSubmit({...form.getValues(), activateAccount: true})}>Aceptar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </>
  )
}

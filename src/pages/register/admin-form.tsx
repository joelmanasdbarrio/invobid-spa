import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field'
import { Form } from '@/components/ui/form'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { AuthContext } from '@/contexts/auth.context.ts'
import { createAdmin } from '@/services/admin.api'
import { zodResolver } from '@hookform/resolvers/zod'
import Cookies from 'js-cookie'
import { EllipsisIcon, MailIcon, UserIcon } from 'lucide-react'
import { use } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { z } from 'zod'

const formSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.email('Correo electrónico no válido'),
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  passwordRepeat: z.string()
    .min(6, 'La repetición de la contraseña debe tener al menos 6 caracteres')
}).refine((data) => data.password === data.passwordRepeat, {
  message: 'Las contraseñas no coinciden',
  path: ['passwordRepeat']
})

export default function AdminForm () {
  const navigate = useNavigate()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      passwordRepeat: ''
    }
  })

  const authContext = use(AuthContext)
  if (!authContext) {
    throw new Error('AuthContext must be used within AuthProvider')
  }
  const { setLoggedInUser } = authContext
  function onSubmit (formData: z.infer<typeof formSchema>) {
    const body = JSON.stringify(formData)
    createAdmin(body, (res) => {
      Cookies.set('logged-in-user', JSON.stringify(res.data), { expires: 1 })
      setLoggedInUser(res.data)

      navigate('/dashboard')
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Administrador</CardTitle>
        <CardDescription>
          Gestiona la plataforma, modera y da soporte a usuarios y subastas.
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
                    <FieldLabel htmlFor={field.name}>Nombre completo</FieldLabel>
                    <InputGroup>
                      <InputGroupInput {...field} aria-invalid={fieldState.invalid} id={field.name} type='text' placeholder='John Doe' required />
                      <InputGroupAddon>
                        <UserIcon />
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

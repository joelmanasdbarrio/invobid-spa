import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator} from '@/components/ui/field'
import {Form} from '@/components/ui/form'
import {InputGroup, InputGroupAddon, InputGroupInput} from '@/components/ui/input-group'
import {login} from '@/services/auth.api'
import {zodResolver} from '@hookform/resolvers/zod'
import {Controller, useForm} from 'react-hook-form'
import {useNavigate} from 'react-router'
import {z} from 'zod'
import {useContext} from 'react'
import {AuthContext} from '@/contexts/auth.context'
import Cookies from 'js-cookie'
import {Checkbox} from '@/components/ui/checkbox.tsx'

const formSchema = z.object({
  email: z.email(),
  password: z.string(),
  rememberMe: z.boolean()
})

export default function LoginForm () {
  const navigate = useNavigate()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  })

  const authContext = useContext(AuthContext)
  if (!authContext) {
    throw new Error('AuthContext must be used within AuthProvider')
  }
  const { setLoggedInUser } = authContext
  function onSubmit (data: z.infer<typeof formSchema>) {
    const body = JSON.stringify(data)
    login(body, (res) => {
      Cookies.set('logged-in-user', JSON.stringify(res.data), { expires: data.rememberMe ? 30 : 1 })
      setLoggedInUser(res.data)

      return navigate('/')
    })
  }

  return (
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
                name='password'
                control={form.control}
                render={({field, fieldState})=> (
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
            </FieldGroup>
            <FieldGroup className='flex flex-row justify-between'>
              <Controller
                name='rememberMe'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className='flex flex-row gap-2 items-end w-min'>
                    <FieldLabel htmlFor={field.name}>Recuérdame</FieldLabel>
                    <Checkbox id={field.name} checked={field.value} onCheckedChange={field.onChange} className='w-4! h-4!' />
                  </Field>
                )}
              />
              <a
                href='#'
                className='ml-auto text-sm underline-offset-4 hover:underline'
              >
                ¿Has olvidado tu contraseña?
              </a>
            </FieldGroup>
            <FieldGroup>
              <Field>
                <Button type='submit' className='hover:cursor-pointer'>Iniciar sesión</Button>
                <FieldSeparator />
                <FieldDescription className='text-center'>
                  ¿No tienes cuenta?{' '}
                  <a href='/register' className='underline underline-offset-4'>
                    Regístrate
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

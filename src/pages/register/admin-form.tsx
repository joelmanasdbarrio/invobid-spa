import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field'
import { Form } from '@/components/ui/form'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

const formSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string()
    .email('Correo electrónico no válido'),
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  passwordRepeat: z.string()
    .min(6, 'La repetición de la contraseña debe tener al menos 6 caracteres')
}).refine((data) => data.password === data.passwordRepeat, {
  message: 'Las contraseñas no coinciden',
  path: ['passwordRepeat']
})

export default function AdminForm () {
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

  function onSubmit (data: z.infer<typeof formSchema>) {
    fetch('http://localhost:3000/api/v1/admins', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(async (response) => {
      if (response.ok) {
        console.log('Registro completado con éxito')
      } else {
        const errorData = await response.json()
        console.error(`Error: ${errorData.message || 'Error desconocido'}`)
      }
    }).catch((error) => {
      console.error(`Error de red: ${error.message}`)
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

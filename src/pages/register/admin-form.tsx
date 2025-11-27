import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'

export default function AdminForm () {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Administrador</CardTitle>
        <CardDescription>
          Gestiona la plataforma, modera y da soporte a usuarios y subastas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className='flex flex-col gap-4'>
          <FieldGroup className='flex flex-col gap-4 sm:grid sm:grid-cols-2'>
            <Field>
              <FieldLabel htmlFor='name'>Nombre completo</FieldLabel>
              <InputGroup>
                <InputGroupInput id='name' name='name' type='text' placeholder='John Doe' required />
                <InputGroupAddon>
                  <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path stroke='none' d='M0 0h24v24H0z' fill='none'/><path d='M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0' /><path d='M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2' /></svg>
                </InputGroupAddon>
              </InputGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor='email'>Correo</FieldLabel>
              <InputGroup>
                <InputGroupInput id='email' name='email' type='email' placeholder='m@example.com' required />
                <InputGroupAddon>
                  <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path stroke='none' d='M0 0h24v24H0z' fill='none'/><path d='M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z' /><path d='M3 7l9 6l9 -6' /></svg>
                </InputGroupAddon>
              </InputGroup>
            </Field>
          </FieldGroup>
          <FieldGroup className='flex flex-col gap-4 sm:grid sm:grid-cols-2'>
            <Field>
              <FieldLabel htmlFor='password'>Contraseña</FieldLabel>
              <InputGroup>
                <InputGroupInput id='password' name='password' type='password' required />
                <InputGroupAddon>
                  <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path stroke='none' d='M0 0h24v24H0z' fill='none'/><path d='M12 10v4' /><path d='M10 13l4 -2' /><path d='M10 11l4 2' /><path d='M5 10v4' /><path d='M3 13l4 -2' /><path d='M3 11l4 2' /><path d='M19 10v4' /><path d='M17 13l4 -2' /><path d='M17 11l4 2' /></svg>
                </InputGroupAddon>
              </InputGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor='password-repeat'>Repetir contraseña</FieldLabel>
              <InputGroup>
                <InputGroupInput id='password-repeat' name='passwordRepeat' type='password' required />
                <InputGroupAddon>
                  <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path stroke='none' d='M0 0h24v24H0z' fill='none'/><path d='M12 10v4' /><path d='M10 13l4 -2' /><path d='M10 11l4 2' /><path d='M5 10v4' /><path d='M3 13l4 -2' /><path d='M3 11l4 2' /><path d='M19 10v4' /><path d='M17 13l4 -2' /><path d='M17 11l4 2' /></svg>
                </InputGroupAddon>
              </InputGroup>
            </Field>
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
      </CardContent>
    </Card>
  )
}

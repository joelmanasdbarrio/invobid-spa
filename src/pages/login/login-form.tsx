import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'

export default function LoginForm () {
  return (
    <Card>
      <CardHeader>
        <CardTitle>¡Bienvenido de vuelta!</CardTitle>
      </CardHeader>
      <CardContent>
        <form>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor='email'>Correo</FieldLabel>
              <InputGroup>
                <InputGroupInput id='email' type='email' placeholder='m@example.com' required />
                <InputGroupAddon>
                  <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path stroke='none' d='M0 0h24v24H0z' fill='none'/><path d='M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z' /><path d='M3 7l9 6l9 -6' /></svg>
                </InputGroupAddon>
              </InputGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor='password'>Contraseña</FieldLabel>
              <InputGroup>
                <InputGroupInput id='password' type='password' required />
                <InputGroupAddon>
                  <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path stroke='none' d='M0 0h24v24H0z' fill='none'/><path d='M12 10v4' /><path d='M10 13l4 -2' /><path d='M10 11l4 2' /><path d='M5 10v4' /><path d='M3 13l4 -2' /><path d='M3 11l4 2' /><path d='M19 10v4' /><path d='M17 13l4 -2' /><path d='M17 11l4 2' /></svg>
                </InputGroupAddon>
              </InputGroup>
              <a
                href='#'
                className='ml-auto text-sm underline-offset-4 hover:underline'
              >
                ¿Has olvidado tu contraseña?
              </a>
            </Field>
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
      </CardContent>
    </Card>
  )
}

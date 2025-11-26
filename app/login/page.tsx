import LoginForm from './login-form'

export default function Login () {
  return (
    <div className='grow flex flex-col sm:items-center sm:justify-center p-4'>
      <div className='flex flex-col gap-4 w-full max-w-2xl'>
        <div className='flex flex-col items-center gap-1 text-center'>
          <h1 className='text-2xl font-bold'>Iniciar sesión en {process.env.APP_NAME?.toUpperCase()}</h1>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
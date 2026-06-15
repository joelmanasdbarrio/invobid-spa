import { Button } from '@/components/ui/button.tsx'
import {
  ArrowRightIcon,
  BanknoteIcon,
  BriefcaseBusinessIcon,
  CalculatorIcon,
  EyeIcon,
  FileCheckIcon,
  LandmarkIcon,
  LockIcon,
  ScaleIcon,
  ShieldIcon,
  TrendingUpIcon,
  UploadIcon,
  UserCheckIcon,
  UsersIcon,
  WalletIcon,
  ZapIcon
} from 'lucide-react'
import { Link } from 'react-router'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Field, FieldLabel } from '@/components/ui/field.tsx'
import { Slider } from '@/components/ui/slider.tsx'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Form } from '@/components/ui/form.tsx'
import { formatCurrency } from '@/lib/format-currency.ts'
import { formatPercentage } from '@/lib/format-percentage.ts'
import { Separator } from '@/components/ui/separator.tsx'
import { ItemTitle } from '@/components/ui/item.tsx'

export default function Landing () {
  const simulationForm = useForm({
    defaultValues: {
      simulationPrice: 10000,
      simulationDiscount: 8,
      simulationFee: import.meta.env.VITE_SELLER_TRANSFER_FEE_PERCENTAGE || 3
    }
  })

  const simulationPrice = Number(useWatch({ control: simulationForm.control, name: 'simulationPrice' }) || 0)
  const simulationDiscount = Number(useWatch({ control: simulationForm.control, name: 'simulationDiscount' }) || 0)
  const simulationFee = Number(useWatch({ control: simulationForm.control, name: 'simulationFee' }) || 0)

  const simulationDiscountValue = simulationPrice - (simulationPrice - (simulationPrice * simulationDiscount / 100))
  const simulationFeeValue = (simulationPrice - simulationDiscountValue) * simulationFee / 100
  const simulationPriceFinal = simulationPrice - simulationDiscountValue - simulationFeeValue

  return (
    <div className='bg-muted overflow-scroll'>
      <div className='container mx-auto flex flex-col gap-20 p-4'>
        <header className='flex flex-col gap-8 py-10'>
          <h1 className='text-5xl!'>Convierte tus facturas en liquidez <span className='text-primary'>al mejor precio del mercado</span></h1>
          <p className='text-muted-foreground text-lg'>Publica tu factura. Los bancos compiten. Tú eliges la mejor oferta. Sin negociaciones individuales, sin opacidad.</p>
          <div className='flex gap-4'>
            <Button asChild>
              <a href='#simulation'>
                <CalculatorIcon className='size-4' />
                Simular operación
              </a>
            </Button>
            <Button variant='outline' asChild>
              <Link to='/register'>
                <UploadIcon className='size-4' />
                Publicar factura
              </Link>
            </Button>
          </div>
        </header>

        <section id='process' className='flex flex-col gap-6 text-center'>
          <header className='flex flex-col gap-2 items-center'>
            <h3 className='text-xl uppercase text-primary font-mono'>Proceso</h3>
            <h2 className='text-4xl!'>¿Cómo funciona?</h2>
            <p className='text-muted-foreground'>Tres pasos simples para convertir tus facturas pendientes de cobro en liquidez inmediata.</p>
          </header>

          <div className='flex flex-col md:grid md:grid-cols-3 gap-6 justify-around'>
            <div className='flex flex-col items-center gap-4'>
              <div className='flex flex-col items-center'>
                <span className='text-5xl text-primary/20 font-extrabold'>1</span>
                <span className='rounded-lg p-4 bg-primary/20 text-primary'>
                  <UploadIcon className='size-8' />
                </span>
              </div>
              <h4 className='text-xl font-bold'>Sube tu factura</h4>
              <p className='text-muted-foreground'>
                Registra los datos de deudor y factura en la plataforma. El proceso es 100 % digital y tarda menos de 5 minutos.
              </p>
            </div>

            <div className='flex flex-col items-center gap-4'>
              <div className='flex flex-col items-center'>
                <span className='text-5xl text-primary/20 font-extrabold'>2</span>
                <span className='rounded-lg p-4 bg-primary/20 text-primary'>
                  <UsersIcon className='size-8' />
                </span>
              </div>
              <h4 className='text-xl font-bold'>Las entidades financieras pujan</h4>
              <p className='text-muted-foreground'>
                Bancos y fondos registrados compiten ofreciendo el mejor tipo de descuento para tu factura en una subasta transparente.
              </p>
            </div>

            <div className='flex flex-col items-center gap-4'>
              <div className='flex flex-col items-center'>
                <span className='text-5xl text-primary/20 font-extrabold'>3</span>
                <span className='rounded-lg p-4 bg-primary/20 text-primary'>
                  <BanknoteIcon className='size-8' />
                </span>
              </div>
              <h4 className='text-xl font-bold'>Recibes el dinero</h4>
              <p className='text-muted-foreground'>
                Eliges la oferta que más te conviene y recibes la liquidez en tu cuenta. No es un préstamo, es un anticipo de derechos de cobro.
              </p>
            </div>
          </div>

          <p className='text-sm text-center italic text-muted-foreground py-6'>Importante: el factoring no es un préstamo. Se trata de la cesión de un derecho de cobro, lo que ofrece una alternativa de financiación ágil y transparente.</p>
        </section>

        <section id='simulation' className='flex flex-col gap-6'>
          <header className='flex flex-col gap-2 items-center text-center'>
            <h3 className='text-xl uppercase text-primary font-mono'>Simulador</h3>
            <h2 className='text-4xl!'>Calcula tu operación de factoring</h2>
            <p className='text-muted-foreground'>Introduce los datos de tu factura y descubre cuánta liquidez podrías obtener hoy.</p>
          </header>

          <div className='flex flex-col md:grid md:grid-cols-2 xl:grid-cols-4 gap-6 justify-around'>
            <Card className='xl:col-start-2'>
              <CardContent>
                <Form {...simulationForm}>
                  <form className='flex flex-col gap-6'>
                    <Controller
                      name='simulationPrice'
                      control={simulationForm.control}
                      render={({ field }) => (
                        <Field>
                          <div className='flex items-center justify-between'>
                            <FieldLabel htmlFor={field.name}>Importe de la factura</FieldLabel>
                            <span className='font-bold'>{formatCurrency(simulationPrice)}</span>
                          </div>
                          <Slider
                            defaultValue={[simulationPrice]}
                            onChange={(value) => field.onChange(value)}
                            min={1000}
                            max={100000}
                            step={1000}
                          />
                          <div className='flex items-center justify-between text-muted-foreground text-sm'>
                            <span>{formatCurrency(1000)}</span>
                            <span>{formatCurrency(100000)}</span>
                          </div>
                        </Field>
                      )}
                    />
                    <Controller
                      name='simulationDiscount'
                      control={simulationForm.control}
                      render={({ field }) => (
                        <Field>
                          <div className='flex items-center justify-between'>
                            <FieldLabel htmlFor={field.name}>Tipo de descuento (% anual)</FieldLabel>
                            <span className='font-bold'>{formatPercentage(simulationDiscount)}</span>
                          </div>
                          <Slider
                            defaultValue={[simulationDiscount]}
                            onChange={(value) => field.onChange(value)}
                            min={0}
                            max={50}
                            step={0.1}
                          />
                          <div className='flex items-center justify-between text-muted-foreground text-sm'>
                            <span>{formatPercentage(0)}</span>
                            <span>{formatPercentage(50)}</span>
                          </div>
                        </Field>
                      )}
                    />
                    <Controller
                      name='simulationFee'
                      control={simulationForm.control}
                      render={({ field }) => (
                        <Field>
                          <div className='flex items-center justify-between'>
                            <FieldLabel htmlFor={field.name}>Comisión de gestión (%)</FieldLabel>
                            <span className='font-bold'>{formatPercentage(simulationFee)}</span>
                          </div>
                          <Slider
                            defaultValue={[simulationFee]}
                            onChange={(value) => field.onChange(value)}
                            min={0}
                            max={5}
                            step={0.01}
                            disabled
                          />
                          <div className='flex items-center justify-between text-muted-foreground text-sm'>
                            <span>{formatPercentage(0)}</span>
                            <span>{formatPercentage(5)}</span>
                          </div>
                        </Field>
                      )}
                    />
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card className='text-muted-foreground [&_ul]:w-full [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-4 [&_ul_li]:flex [&_ul_li]:justify-between'>
              <CardHeader>
                <span>Recibirías hoy</span>
                <span className='text-4xl text-primary font-bold'>{formatCurrency(simulationPriceFinal)}</span>
              </CardHeader>
              <Separator />
              <CardContent>
                <ul>
                  <li>
                    <span>Importe factura</span>
                    <span>{formatCurrency(simulationPrice)}</span>
                  </li>
                  <li>
                    <span>Descuento</span>
                    <span className='text-destructive'>- {formatCurrency(simulationDiscountValue)}</span>
                  </li>
                  <li>
                    <span>Comisión de gestión</span>
                    <span className='text-destructive'>- {formatCurrency(simulationFeeValue)}</span>
                  </li>
                </ul>
              </CardContent>
              <Separator />
              <CardFooter className='font-bold'>
                <ul>
                  <li>
                    <span className='text-foreground'>Coste total</span>
                    <span className='text-destructive'>{formatCurrency(simulationDiscountValue - simulationFeeValue)}</span>
                  </li>
                </ul>
              </CardFooter>
            </Card>
          </div>
        </section>

        <section id='benefits' className='flex flex-col gap-6'>
          <header className='flex flex-col gap-2 items-center text-center'>
            <h3 className='text-xl uppercase text-primary font-mono'>Ventajas</h3>
            <h2 className='text-4xl!'>¿Por qué elegirnos?</h2>
            <p className='text-muted-foreground'>Frente al factoring tradicional, nuestro modelo de subasta ofrece ventajas claras.</p>
          </header>

          <div className='grid md:grid-cols-2 gap-6'>
            <Card className='p-0'>
              <CardContent className='p-10 flex flex-row gap-6'>
                <div className='flex flex-col items-center'>
                  <span className='rounded-lg p-4 bg-primary/20 text-primary'>
                    <ScaleIcon className='size-6'/>
                  </span>
                </div>
                <div className='flex flex-col gap-2'>
                  <CardTitle>Competencia real entre entidades</CardTitle>
                  <CardDescription>Múltiples bancos y fondos pujan por tu factura. Más competencia significa mejores condiciones para ti.</CardDescription>
                </div>
              </CardContent>
            </Card>
            <Card className='p-0'>
              <CardContent className='p-10 flex flex-row gap-6'>
                <div className='flex flex-col items-center'>
                  <span className='rounded-lg p-4 bg-primary/20 text-primary'>
                    <EyeIcon className='size-6'/>
                  </span>
                </div>
                <div className='flex flex-col gap-2'>
                  <CardTitle>Transparencia total en tipos</CardTitle>
                  <CardDescription className='line-clamp-none'>Ves todas las ofertas en tiempo real. Sin negociaciones opacas, sin comisiones ocultas.</CardDescription>
                </div>
              </CardContent>
            </Card>
            <Card className='p-0'>
              <CardContent className='p-10 flex flex-row gap-6'>
                <div className='flex flex-col items-center'>
                  <span className='rounded-lg p-4 bg-primary/20 text-primary'>
                    <ZapIcon className='size-6'/>
                  </span>
                </div>
                <div className='flex flex-col gap-2'>
                  <CardTitle>Digital y rápido</CardTitle>
                  <CardDescription className='line-clamp-none'>Proceso 100 % online. Desde la publicación de la factura hasta la recepción de fondos, todo en una plataforma.</CardDescription>
                </div>
              </CardContent>
            </Card>
            <Card className='p-0'>
              <CardContent className='p-10 flex flex-row gap-6'>
                <div className='flex flex-col items-center'>
                  <span className='rounded-lg p-4 bg-primary/20 text-primary'>
                    <TrendingUpIcon className='size-6'/>
                  </span>
                </div>
                <div className='flex flex-col gap-2'>
                  <ItemTitle>CardTitle negociación individual</ItemTitle>
                  <CardDescription className='line-clamp-none'>Olvídate de llamar a varios bancos. El mercado trabaja por ti y encuentras el mejor precio automáticamente.</CardDescription>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id='segments' className='flex flex-col gap-6'>
          <header className='flex flex-col gap-2 items-center text-center'>
            <h3 className='text-xl uppercase text-primary font-mono'>Segmentos</h3>
            <h2 className='text-4xl!'>¿Para quién es?</h2>
          </header>

          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <Card className='p-0'>
              <CardContent className='p-6 flex flex-col items-center text-center gap-6'>
                <div className='flex flex-col items-center'>
                  <span className='rounded-lg p-4 bg-chart-2/20 text-chart-2'>
                    <BriefcaseBusinessIcon className='size-6'/>
                  </span>
                </div>
                <CardTitle>PYMES</CardTitle>
                <CardDescription className='line-clamp-none'>Accede a financiación competitiva sin depender de un solo banco. Mejora tus condiciones de descuento.</CardDescription>
              </CardContent>
            </Card>
            <Card className='p-0'>
              <CardContent className='p-6 flex flex-col items-center text-center gap-6'>
                <div className='flex flex-col items-center'>
                  <span className='rounded-lg p-4 bg-chart-2/20 text-chart-2'>
                    <UserCheckIcon className='size-6'/>
                  </span>
                </div>
                <CardTitle>Autónomos</CardTitle>
                <CardDescription className='line-clamp-none'>Convierte tus facturas pendientes en liquidez inmediata para seguir invirtiendo en tu negocio.</CardDescription>
              </CardContent>
            </Card>
            <Card className='p-0'>
              <CardContent className='p-6 flex flex-col items-center text-center gap-6'>
                <div className='flex flex-col items-center'>
                  <span className='rounded-lg p-4 bg-chart-2/20 text-chart-2'>
                    <TrendingUpIcon className='size-6'/>
                  </span>
                </div>
                <CardTitle>Empresas en crecimiento</CardTitle>
                <CardDescription className='line-clamp-none'>Financia tu crecimiento sin endeudarte. Anticipa el cobro de tus facturas y reinvierte con agilidad.</CardDescription>
              </CardContent>
            </Card>
            <Card className='p-0'>
              <CardContent className='p-6 flex flex-col items-center text-center gap-6'>
                <div className='flex flex-col items-center'>
                  <span className='rounded-lg p-4 bg-chart-2/20 text-chart-2'>
                    <WalletIcon className='size-6'/>
                  </span>
                </div>
                <CardTitle>Tensión de tesorería</CardTitle>
                <CardDescription className='line-clamp-none'>Resuelve desfases de caja de forma rápida y transparente, eligiendo siempre la mejor oferta del mercado.</CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id='trust' className='flex flex-col gap-6'>
          <header className='flex flex-col gap-2 items-center text-center'>
            <h3 className='text-xl uppercase text-primary font-mono'>Confianza</h3>
            <h2 className='text-4xl!'>Seguridad y cumplimiento</h2>
            <p className='text-muted-foreground'>Tu tranquilidad es nuestra prioridad. Operamos con los más altos estándares del sector financiero.</p>
          </header>

          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <Card className='p-0'>
              <CardContent className='p-6 flex flex-col items-center text-center gap-6'>
                <div className='flex flex-col items-center'>
                  <span className='rounded-full p-4 bg-primary/20 text-primary'>
                    <ShieldIcon className='size-6'/>
                  </span>
                </div>
                <CardTitle>Cumplimiento normativo</CardTitle>
                <CardDescription className='line-clamp-none'>Operamos dentro del marco regulatorio español, garantizando la legalidad de cada operación.</CardDescription>
              </CardContent>
            </Card>
            <Card className='p-0'>
              <CardContent className='p-6 flex flex-col items-center text-center gap-6'>
                <div className='flex flex-col items-center'>
                  <span className='rounded-full p-4 bg-primary/20 text-primary'>
                    <LockIcon className='size-6'/>
                  </span>
                </div>
                <CardTitle>Protección de datos</CardTitle>
                <CardDescription className='line-clamp-none'>Tus datos financieros están cifrados y protegidos conforme al RGPD y la legislación española vigente.</CardDescription>
              </CardContent>
            </Card>
            <Card className='p-0'>
              <CardContent className='p-6 flex flex-col items-center text-center gap-6'>
                <div className='flex flex-col items-center'>
                  <span className='rounded-full p-4 bg-primary/20 text-primary'>
                    <LandmarkIcon className='size-6'/>
                  </span>
                </div>
                <CardTitle>Entidades reguladas</CardTitle>
                <CardDescription className='line-clamp-none'>Colaboramos exclusivamente con bancos y fondos autorizados y supervisados por los organismos competentes.</CardDescription>
              </CardContent>
            </Card>
            <Card className='p-0'>
              <CardContent className='p-6 flex flex-col items-center text-center gap-6'>
                <div className='flex flex-col items-center'>
                  <span className='rounded-full p-4 bg-primary/20 text-primary'>
                    <FileCheckIcon className='size-6'/>
                  </span>
                </div>
                <CardTitle>Plataforma segura</CardTitle>
                <CardDescription className='line-clamp-none'>Infraestructura con los más altos estándares de seguridad, auditorías periódicas y acceso verificado.</CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className='flex flex-col gap-6'>
          <header className='flex flex-col gap-2 items-center text-center'>
            <h2 className='text-4xl!'>Deja que el mercado compita por tu factura</h2>
            <p className='text-muted-foreground'>Únete a las empresas que ya financian sus facturas al mejor precio, de forma digital y transparente.</p>
          </header>
          <div className='flex gap-4 items-center justify-center'>
            <Button asChild>
              <Link to='/register'>
                Crear cuenta
                <ArrowRightIcon className='size-4' />
              </Link>
            </Button>
            <Button variant='outline' asChild>
              <a href='#simulation'>
                <CalculatorIcon className='size-4' />
                Simular operación
              </a>
            </Button>
          </div>
        </section>

      </div>
      <footer className='py-10 mt-10 bg-background border-t text-muted-foreground'>
        <div className='container mx-auto flex items-center justify-between'>
          <span>&copy; 2026 InvoBid. Todos los derechos reservados.</span>
          <ul className='flex gap-2 items-center'>
            <li>
              <Link to='#' className='hover:text-foreground'>Aviso legal</Link>
            </li>
            <li>
              <Link to='#' className='hover:text-foreground'>Privacidad</Link>
            </li>
            <li>
              <Link to='#' className='hover:text-foreground'>Cookies</Link>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  )
}

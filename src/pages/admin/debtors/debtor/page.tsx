import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Form } from '@/components/ui/form'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupTextarea } from '@/components/ui/input-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { getDebtorById, updateDebtorById } from '@/services/debtor.api'
import { type Debtor, DebtorStatus } from '@/types/Debtor'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  BuildingIcon,
  CheckCheckIcon,
  CheckIcon,
  CircleAlertIcon,
  ClockIcon,
  CopyIcon,
  ExternalLinkIcon,
  HandCoinsIcon,
  IdCardIcon,
  LockIcon,
  LockOpenIcon,
  MailIcon,
  OctagonXIcon,
  PhoneIcon,
  SaveIcon
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router'
import z from 'zod'
import { DebtorChangeHistory } from './debtor-change-history'
import DebtorDocuments from './debtor-documents/debtor-documents'

const formSchema = z.object({
  email: z.string().optional(),
  phoneNumber: z.coerce.number<number>().optional(),
  companyName: z.string().optional(),
  taxId: z.string().optional(),
  lastCommunication: z.string().optional()
})

export default function AdminDebtorPage ({ setLastBreadcrumb }: { setLastBreadcrumb: (breadcrumb: string) => void }) {
  const {debtorId} = useParams()
  const [debtor, setDebtor] = useState<Debtor | undefined>()
  const [originalDebtor, setOriginalDebtor] = useState<Debtor | undefined>(debtor)
  const [isFormDisabled, setIsFormDisabled] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const navigate = useNavigate()
  useEffect(() => {
    if (debtorId) {
      getDebtorById(debtorId)
        .then(res => res.data)
        .then(debtor => {
          setDebtor(debtor)
          setOriginalDebtor(debtor)
          setLastBreadcrumb(debtor.companyName)
        })
        .catch(() => {
          navigate('/admin/debtors')
        })
    }
  }, [debtorId, navigate, setLastBreadcrumb])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: {
      email: debtor?.email,
      phoneNumber: debtor?.phoneNumber,
      companyName: debtor?.companyName,
      taxId: debtor?.taxId,
      lastCommunication: ''
    }
  })

  useEffect(() => {
    form.reset({
      email: debtor?.email,
      phoneNumber: debtor?.phoneNumber,
      companyName: debtor?.companyName,
      taxId: debtor?.taxId,
      lastCommunication: ''
    })
  }, [debtor, form])

  function onSubmit (data: z.infer<typeof formSchema>) {
    if (!debtor) return

    const updateData = {
      email: data.email,
      phoneNumber: data.phoneNumber,
      companyName: data.companyName,
      taxId: data.taxId,
      status: debtor.status,
      ...(data.lastCommunication && { lastCommunication: data.lastCommunication })
    }

    updateDebtorById(debtor.id, JSON.stringify(updateData))
      .then(res => res.data)
      .then(updatedDebtor => {
        setDebtor(updatedDebtor)
        setOriginalDebtor(updatedDebtor)
        form.reset({
          email: updatedDebtor.email,
          phoneNumber: updatedDebtor.phoneNumber,
          companyName: updatedDebtor.companyName,
          taxId: updatedDebtor.taxId,
          lastCommunication: ''
        })
        setIsFormDisabled(true)
        setIsDialogOpen(false)
      })
      .then(() => navigate(`/admin/debtors/${debtor.id}`))
  }

  function handleReset () {
    form.reset()
    setDebtor(originalDebtor)
  }

  function copyToClipboard (e: React.MouseEvent<HTMLButtonElement>, text: string | number) {
    e.preventDefault()
    navigator.clipboard.writeText(String(text))
    const button = e.currentTarget
    button.setAttribute('data-copied', 'true')
    setTimeout(() => {
      button.removeAttribute('data-copied')
    }, 2000)
  }

  const updateNotesMap: Record<string, string> = {
    correctVerification: 'Deudor verificado correctamente',
    updatedCompanyName: 'Se ha actualizado la razón social',
    incorrect111Document: 'El modelo 111 de hacienda es incorrecto o no es legible',
    incorrect303Document: 'El modelo 303 de hacienda es incorrecto o no es legible',
    incorrectBothDocuments: 'Los modelos 111 & 303 de hacienda son incorrectos o no legibles'
  }

  return (
    <section className='flex flex-col gap-4'>
      <div className='flex items-center gap-2'>
        <span className='rounded-lg p-1 bg-primary/20 text-primary'>
          <HandCoinsIcon className='w-6 h-6' />
        </span>
        <h2>Gestionar deudor</h2>
      </div>
      <div className='grid xl:grid-cols-3 gap-4'>
        <Card className='xl:col-span-2'>
          <Form {...form}>
            <form id='debtor-form' onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4'>
              <CardHeader className='flex flex-col xl:flex-row gap-2'>
                <h3>Detalle del deudor <span className='text-primary'>{debtor?.companyName}</span></h3>
                <ButtonGroup className='xl:ms-auto flex-row-reverse xl:flex-row'>
                  <ButtonGroup>
                    {isFormDisabled
                      ? (
                        <Button type='button' variant='outline' onClick={() => setIsFormDisabled(false)}>
                          <LockIcon />
                        </Button>
                      ) : (
                        <Button type='button' variant='outline' onClick={() => setIsFormDisabled(true)}>
                          <LockOpenIcon />
                        </Button>
                      )}
                  </ButtonGroup>

                  <ButtonGroup>
                    <Button type='button' variant='outline' className='bg-zinc-300/25 dark:bg-zinc-300/25' onClick={() => debtor && setDebtor({...debtor, status: DebtorStatus.DENIED})}>
                      <OctagonXIcon className='rounded-full text-zinc-600'/>
                      {debtor?.status === DebtorStatus.DENIED && 'Denegado'}
                    </Button>
                    <Button type='button' variant='outline' className='bg-red-300/25 dark:bg-red-300/25' onClick={() => debtor && setDebtor({...debtor, status: DebtorStatus.CORRECTION})}>
                      <CircleAlertIcon className='w-5 h-5 rounded-full text-red-600'/>
                      {debtor?.status === DebtorStatus.CORRECTION && 'Corrección'}
                    </Button>
                    <Button type='button' variant='outline' className='bg-yellow-300/25 dark:bg-yellow-300/25' onClick={() => debtor && setDebtor({...debtor, status: DebtorStatus.PENDING})}>
                      <ClockIcon className='w-5 h-5 rounded-full text-yellow-600'/>
                      {debtor?.status === DebtorStatus.PENDING && 'Por verificar'}
                    </Button>
                    <Button type='button' variant='outline' className='bg-green-300/25 dark:bg-green-300/25' onClick={() => debtor && setDebtor({...debtor, status: DebtorStatus.VERIFIED})}>
                      <CheckCheckIcon className='w-5 h-5 rounded-full text-green-600'/>
                      {debtor?.status === DebtorStatus.VERIFIED && 'Verificado'}
                    </Button>
                  </ButtonGroup>
                </ButtonGroup>
              </CardHeader>

              <CardContent className='flex flex-col gap-4'>
                <FieldSet>
                  <FieldGroup className='flex flex-col gap-4 xl:grid xl:grid-cols-2'>
                    <Controller
                      name='taxId'
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor={field.name}>CIF/NIF:</FieldLabel>
                          <InputGroup>
                            <InputGroupInput {...field} aria-invalid={fieldState.invalid} id={field.name} type='text' placeholder='12345678A' required disabled={isFormDisabled} />
                            <InputGroupAddon>
                              <IdCardIcon />
                            </InputGroupAddon>
                            <InputGroupAddon align='inline-end'>
                              <button onClick={(e) => copyToClipboard(e, debtor?.taxId ?? '')} className='group'>
                                <CopyIcon className='w-4 h-4 hover:cursor-pointer transition-all absolute top-1/2 right-2 -translate-y-1/2 rotate-0 scale-100 group-data-[copied=true]:-rotate-90 group-data-[copied=true]:scale-0' />

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span>
                                      <CheckIcon className='w-4 h-4 hover:cursor-pointer transition-all absolute top-1/2 right-2 -translate-y-1/2 rotate-90 scale-0 group-data-[copied=true]:rotate-0 group-data-[copied=true]:scale-100' />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent className='relative -top-2 right-3'>
                                    <p className='text-center'>¡Copiado!</p>
                                  </TooltipContent>
                                </Tooltip>
                              </button>
                            </InputGroupAddon>
                          </InputGroup>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                    <Controller
                      name='companyName'
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor={field.name}>Razón social:</FieldLabel>
                          <InputGroup>
                            <InputGroupInput {...field} aria-invalid={fieldState.invalid} id={field.name} type='text' placeholder='ACME S.L.' required disabled={isFormDisabled} />
                            <InputGroupAddon>
                              <BuildingIcon />
                            </InputGroupAddon>
                            <InputGroupAddon align='inline-end'>
                              <button onClick={(e) => copyToClipboard(e, debtor?.companyName ?? '')} className='group'>
                                <CopyIcon className='w-4 h-4 hover:cursor-pointer transition-all absolute top-1/2 right-2 -translate-y-1/2 rotate-0 scale-100 group-data-[copied=true]:-rotate-90 group-data-[copied=true]:scale-0' />

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span>
                                      <CheckIcon className='w-4 h-4 hover:cursor-pointer transition-all absolute top-1/2 right-2 -translate-y-1/2 rotate-90 scale-0 group-data-[copied=true]:rotate-0 group-data-[copied=true]:scale-100' />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent className='relative -top-2 right-3'>
                                    <p className='text-center'>¡Copiado!</p>
                                  </TooltipContent>
                                </Tooltip>
                              </button>
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
                          <FieldLabel htmlFor={field.name}>Correo:</FieldLabel>
                          <InputGroup>
                            <InputGroupInput {...field} aria-invalid={fieldState.invalid} id={field.name} type='email' placeholder='m@example.com' required disabled={isFormDisabled} />
                            <InputGroupAddon>
                              <MailIcon />
                            </InputGroupAddon>
                            <InputGroupAddon align='inline-end'>
                              <button onClick={(e) => copyToClipboard(e, debtor?.email ?? '')} className='group'>
                                <CopyIcon className='w-4 h-4 hover:cursor-pointer transition-all absolute top-1/2 right-2 -translate-y-1/2 rotate-0 scale-100 group-data-[copied=true]:-rotate-90 group-data-[copied=true]:scale-0' />

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span>
                                      <CheckIcon className='w-4 h-4 hover:cursor-pointer transition-all absolute top-1/2 right-2 -translate-y-1/2 rotate-90 scale-0 group-data-[copied=true]:rotate-0 group-data-[copied=true]:scale-100' />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent className='relative -top-2 right-3'>
                                    <p className='text-center'>¡Copiado!</p>
                                  </TooltipContent>
                                </Tooltip>
                              </button>
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
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor={field.name}>Número de teléfono:</FieldLabel>
                          <InputGroup>
                            <InputGroupInput {...field} aria-invalid={fieldState.invalid} id={field.name} type='tel' placeholder='654987321' required disabled={isFormDisabled}/>
                            <InputGroupAddon>
                              <PhoneIcon />
                            </InputGroupAddon>
                            <InputGroupAddon align='inline-end'>
                              <button onClick={(e) => copyToClipboard(e, debtor?.phoneNumber ?? '')} className='group'>
                                <CopyIcon className='w-4 h-4 hover:cursor-pointer transition-all absolute top-1/2 right-2 -translate-y-1/2 rotate-0 scale-100 group-data-[copied=true]:-rotate-90 group-data-[copied=true]:scale-0' />

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span>
                                      <CheckIcon className='w-4 h-4 hover:cursor-pointer transition-all absolute top-1/2 right-2 -translate-y-1/2 rotate-90 scale-0 group-data-[copied=true]:rotate-0 group-data-[copied=true]:scale-100' />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent className='relative -top-2 right-3'>
                                    <p className='text-center'>¡Copiado!</p>
                                  </TooltipContent>
                                </Tooltip>
                              </button>
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
                <Accordion type='multiple'>
                  <FieldSet>
                    <AccordionItem value='investor'>
                      <AccordionTrigger>
                        <div>
                          <FieldLegend>Información del inversor</FieldLegend>
                          <FieldDescription>Inversor que publicó el deudor</FieldDescription>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <FieldGroup className='flex flex-col gap-4 xl:grid xl:grid-cols-2'>
                          <Field>
                            <FieldLabel htmlFor='investorTaxId'>CIF/NIF del inversor:</FieldLabel>
                            <InputGroup>
                              <InputGroupInput id='investorTaxId' value={debtor?.investor?.taxId} type='text' placeholder='12345678A' required disabled />
                              <InputGroupAddon>
                                <IdCardIcon />
                              </InputGroupAddon>
                              <InputGroupAddon align='inline-end'>
                                <button onClick={(e) => copyToClipboard(e, debtor?.investor?.taxId ?? '')} className='group'>
                                  <CopyIcon className='w-4 h-4 hover:cursor-pointer transition-all absolute top-1/2 right-2 -translate-y-1/2 rotate-0 scale-100 group-data-[copied=true]:-rotate-90 group-data-[copied=true]:scale-0' />

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span>
                                        <CheckIcon className='w-4 h-4 hover:cursor-pointer transition-all absolute top-1/2 right-2 -translate-y-1/2 rotate-90 scale-0 group-data-[copied=true]:rotate-0 group-data-[copied=true]:scale-100' />
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent className='relative -top-2 right-3'>
                                      <p className='text-center'>¡Copiado!</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </button>
                              </InputGroupAddon>
                            </InputGroup>
                          </Field>
                          <Field>
                            <FieldLabel htmlFor='investorCompanyName'>Razón social del inversor:</FieldLabel>
                            <InputGroup>
                              <InputGroupInput id='investorCompanyName' value={debtor?.investor?.companyName} type='text' placeholder='ACME S.L.' required disabled />
                              <InputGroupAddon>
                                <BuildingIcon />
                              </InputGroupAddon>
                              <InputGroupAddon align='inline-end'>
                                <button onClick={(e) => copyToClipboard(e, debtor?.investor?.companyName ?? '')} className='group'>
                                  <CopyIcon className='w-4 h-4 hover:cursor-pointer transition-all absolute top-1/2 right-2 -translate-y-1/2 rotate-0 scale-100 group-data-[copied=true]:-rotate-90 group-data-[copied=true]:scale-0' />

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span>
                                        <CheckIcon className='w-4 h-4 hover:cursor-pointer transition-all absolute top-1/2 right-2 -translate-y-1/2 rotate-90 scale-0 group-data-[copied=true]:rotate-0 group-data-[copied=true]:scale-100' />
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent className='relative -top-2 right-3'>
                                      <p className='text-center'>¡Copiado!</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </button>
                              </InputGroupAddon>
                            </InputGroup>
                          </Field>
                          <FieldDescription>
                            <Link to={`/admin/users/${debtor?.investor.id}`} className='text-xs'>
                              Consultar cedente
                              <ExternalLinkIcon className='w-3 h-3 inline-block ml-1' />
                            </Link>
                          </FieldDescription>
                        </FieldGroup>
                      </AccordionContent>
                    </AccordionItem>
                  </FieldSet>
                </Accordion>
                <FieldSet>
                  <FieldGroup>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className='ms-auto w-min' disabled={JSON.stringify(originalDebtor) === JSON.stringify(debtor) && !form.formState.isDirty}>
                          <SaveIcon />
                          Guardar cambios
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>¿Estás seguro de que deseas guardar los cambios?</DialogTitle>
                        </DialogHeader>
                        <DialogDescription>Esta acción actualizará la información del deudor en el sistema, comprueba siempre que los datos son correctos.</DialogDescription>

                        <Controller
                          name='lastCommunication'
                          control={form.control}
                          render={({ field }) => (
                            <Field className='mt-4'>
                              <FieldLabel htmlFor={field.name}>Notas de la actualización:</FieldLabel>
                              <InputGroup>
                                <InputGroupTextarea {...field} id={field.name} placeholder='Se requiere una correción a razón de...' />
                              </InputGroup>
                              <div className='flex flex-wrap gap-1'>
                                {Object.entries(updateNotesMap).map(([key, note]) => (
                                  <Badge
                                    key={key}
                                    variant='outline'
                                    className='hover:cursor-pointer border-dashed hover:bg-accent'
                                    onClick={() => {
                                      form.setValue('lastCommunication', note)
                                    }}
                                  >
                                    {note}
                                  </Badge>
                                ))}
                              </div>
                              <FieldDescription>
                                Este mensaje le indicará al usuario próximas acciones que debe realizar o el motivo de la actualización.
                              </FieldDescription>
                            </Field>
                          )}
                        />

                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant='outline' onClick={handleReset}>
                              Cancelar
                            </Button>
                          </DialogClose>
                          <Button type='submit' form='debtor-form' onClick={form.handleSubmit(onSubmit)}>
                            Confirmar
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </FieldGroup>
                </FieldSet>
              </CardContent>
            </form>
          </Form>
        </Card>

        <DebtorChangeHistory debtor={debtor} />
      </div>

      <DebtorDocuments debtorId={debtor?.id ?? ''} />
    </section>
  )
}

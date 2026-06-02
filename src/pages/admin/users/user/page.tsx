import { Badge } from '@/components/ui/badge'
import { ButtonGroup } from '@/components/ui/button-group.tsx'
import { Button } from '@/components/ui/button.tsx'
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
} from '@/components/ui/dialog.tsx'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field.tsx'
import { Form } from '@/components/ui/form.tsx'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupTextarea } from '@/components/ui/input-group.tsx'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx'
import { copyToClipboard as performCopyToClipboard } from '@/lib/copy-to-clipboard'
import { UserChangeHistory } from '@/pages/admin/users/user/components/user-change-history'
import UserDocuments from '@/pages/admin/users/user/components/user-documents/user-documents'
import { getInvestorById, updateInvestorById } from '@/services/investor.api.ts'
import { DocumentType } from '@/types/Document.ts'
import { type Investor, InvestorStatus, InvestorType } from '@/types/User'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  BuildingIcon,
  CheckCheckIcon,
  CheckIcon,
  CircleAlertIcon,
  ClockIcon,
  CopyIcon,
  IdCardIcon,
  LockIcon,
  LockOpenIcon,
  MailIcon,
  OctagonXIcon,
  PhoneIcon,
  RotateCcwIcon,
  SaveIcon,
  UserIcon,
  UsersIcon
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router'
import { z } from 'zod'
import UserAuctions from './components/user-auctions/user-auctions'
import UserDebtors from './components/user-debtors/user-debtors'
import UserInvoices from './components/user-invoices/user-invoices'

const formSchema = z.object({
  status: z.enum(InvestorStatus).optional(),
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  companyName: z.string()
    .min(1, 'La razón social es obligatoria'),
  email: z.email('Correo electrónico no válido'),
  phoneNumber: z.coerce.number<number>()
    .min(6, 'El número de teléfono es obligatorio'),
  taxId: z.string().optional(),
  investorType: z.enum(InvestorType),
  lastCommunication: z.string().optional()
})

function copyToClipboard (e: React.MouseEvent<HTMLButtonElement>, text: string | number) {
  e.preventDefault()
  const button = e.currentTarget
  performCopyToClipboard(text).then(success => {
    if (success) {
      button.setAttribute('data-copied', 'true')
      setTimeout(() => {
        button.removeAttribute('data-copied')
      }, 2000)
    }
  })
}

const UPDATE_NOTES_MAP: Record<string, string> = {
  correctVerification: 'Usuario verificado correctamente',
  incorrectIdentificationDocument: 'El documento de identificación es incorrecto o no es legible',
  updatedCompanyName: 'Se ha actualizado la razón social'
}

export default function AdminUserPage ({ setLastBreadcrumb }: { setLastBreadcrumb: (breadcrumb: string) => void }) {
  const {investorId} = useParams()
  const [investorState, setInvestorState] = useState<{ investor: Investor | undefined; originalInvestor: Investor | undefined }>({ investor: undefined, originalInvestor: undefined })
  const investor = investorState.investor
  const originalInvestor = investorState.originalInvestor
  const setInvestor = (i: Investor | undefined) => setInvestorState(prev => ({ ...prev, investor: i }))
  const [isFormDisabled, setIsFormDisabled] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const navigate = useNavigate()
  useEffect(() => {
    if (investorId)
      getInvestorById(investorId)
        .then(res => res.data)
        .then(user => {
          setInvestorState({ investor: user, originalInvestor: user })
          setLastBreadcrumb(user.companyName)
        })
        .catch(() => {
          navigate('/admin/users')
        })
  }, [investorId, navigate, setLastBreadcrumb])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: {
      status: investor?.status ?? undefined,
      name: investor?.name,
      companyName: investor?.companyName,
      email: investor?.email,
      phoneNumber: investor?.phoneNumber,
      taxId: investor?.taxId,
      investorType: investor?.investorType,
      lastCommunication: ''
    }
  })

  useEffect(() => {
    form.reset({
      status: investor?.status ?? undefined,
      name: investor?.name,
      companyName: investor?.companyName,
      email: investor?.email,
      phoneNumber: investor?.phoneNumber,
      taxId: investor?.taxId,
      investorType: investor?.investorType,
      lastCommunication: ''
    })
  }, [investor, form])

  const investorType = useWatch({ control: form.control, name: 'investorType' })
  const watchedStatus = useWatch({ control: form.control, name: 'status' })

  function onSubmit (data: z.infer<typeof formSchema>) {
    if (!investor) return

    const updateData = {
      name: data.name,
      companyName: data.companyName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      taxId: data.taxId,
      investorType: data.investorType,
      status: data.status ?? investor?.status ?? InvestorStatus.VERIFIED,
      ...(data.lastCommunication && { lastCommunication: data.lastCommunication })
    }

    updateInvestorById(investor.id, JSON.stringify(updateData))
      .then(res => res.data)
      .then(updatedInvestor => {
        setInvestorState({ investor: updatedInvestor, originalInvestor: updatedInvestor })
        form.reset({
          status: updatedInvestor.status ?? undefined,
          name: updatedInvestor.name,
          companyName: updatedInvestor.companyName,
          email: updatedInvestor.email,
          phoneNumber: updatedInvestor.phoneNumber,
          taxId: updatedInvestor.taxId,
          investorType: updatedInvestor.investorType,
          lastCommunication: ''
        })
        setIsFormDisabled(true)
        setIsDialogOpen(false)
      })
      .then(() => navigate(`/admin/users/${investor.id}`))
  }

  function handleReset () {
    form.reset()
    setInvestor(originalInvestor)
  }

  return (
    <section className='flex flex-col gap-4'>
      <div className='flex items-center gap-2'>
        <span className='rounded-lg p-1 bg-primary/20 text-primary'>
          <UserIcon className='size-6' />
        </span>
        <h2>Gestionar usuario</h2>
      </div>
      <div className='grid xl:grid-cols-3 gap-4'>
        <Card className='xl:col-span-2'>
          <Form {...form}>
            <form id='investor-form' onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4'>
              <CardHeader className='flex flex-col xl:flex-row gap-2'>
                <h3>Detalle del usuario <span className='text-primary'>{investor?.companyName}</span></h3>
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
                    <Button type='button' variant='outline' className='bg-zinc-300/25 dark:bg-zinc-300/10' onClick={() => form.setValue('status', InvestorStatus.DENIED, { shouldDirty: true })}>
                      <OctagonXIcon className='rounded-full text-zinc-600'/>
                      {watchedStatus === InvestorStatus.DENIED && 'Denegado'}
                    </Button>
                    <Button type='button' variant='outline' className='bg-red-300/25 dark:bg-red-300/15' onClick={() => form.setValue('status', InvestorStatus.CORRECTION, { shouldDirty: true })}>
                      <CircleAlertIcon className='size-5 rounded-full text-red-600'/>
                      {watchedStatus === InvestorStatus.CORRECTION && 'Corrección'}
                    </Button>
                    <Button type='button' variant='outline' className='bg-yellow-300/25 dark:bg-yellow-300/15' onClick={() => form.setValue('status', InvestorStatus.PENDING, { shouldDirty: true })}>
                      <ClockIcon className='size-5 rounded-full text-yellow-600'/>
                      {watchedStatus === InvestorStatus.PENDING && 'Por verificar'}
                    </Button>
                    <Button type='button' variant='outline' className='bg-green-300/25 dark:bg-green-300/15' onClick={() => form.setValue('status', InvestorStatus.VERIFIED, { shouldDirty: true })}>
                      <CheckCheckIcon className='size-5 rounded-full text-green-600'/>
                      {watchedStatus === InvestorStatus.VERIFIED && 'Verificado'}
                    </Button>
                  </ButtonGroup>
                </ButtonGroup>
              </CardHeader>

              <CardContent className='flex flex-col gap-4'>
                <FieldSet className='**:data-[slot=field-group]:grid lg:**:data-[slot=field-group]:grid-cols-2'>
                  <FieldGroup>
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
                              <button type='button' onClick={(e) => copyToClipboard(e, investor?.taxId ?? '')} className='group'>
                                <CopyIcon className='size-4 hover:cursor-pointer transition-all absolute top-1/2 right-2 -translate-y-1/2 rotate-0 scale-100 group-data-[copied=true]:-rotate-90 group-data-[copied=true]:scale-0' />

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span>
                                      <CheckIcon className='size-4 hover:cursor-pointer transition-all absolute top-1/2 right-2 -translate-y-1/2 rotate-90 scale-0 group-data-[copied=true]:rotate-0 group-data-[copied=true]:scale-100' />
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
                      name='investorType'
                      control={form.control}
                      render={({ field }) => (
                        <Field>
                          <FieldLabel htmlFor={field.name}>Tipo de inversor:</FieldLabel>
                          <Select value={field.value || ''} onValueChange={field.onChange} defaultValue={field.value || ''} disabled={isFormDisabled}>
                            <SelectTrigger>
                              {field.value ?
                                (
                                  field.value === InvestorType.INDIVIDUAL
                                    ? (
                                      <span className='flex items-center gap-2'>
                                        <UserIcon className='size-4' />
                                        Particular
                                      </span>
                                    ) : field.value === InvestorType.COMPANY ? (
                                      <span className='flex items-center gap-2'>
                                        <BuildingIcon className='size-4' />
                                        Empresa
                                      </span>
                                    ) : (
                                      <span className='flex items-center gap-2'>
                                        {field.value}
                                      </span>
                                    )
                                ) : (
                                  'Selecciona un tipo'
                                )}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={InvestorType.INDIVIDUAL}>
                                <span className='flex items-center gap-2'>
                                  <UserIcon className='size-4' />
                                  Particular
                                </span>
                              </SelectItem>
                              <SelectItem value={InvestorType.COMPANY}>
                                <span className='flex items-center gap-2'>
                                  <BuildingIcon className='size-4' />
                                  Empresa
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                      )}
                    />
                  </FieldGroup>
                  <FieldGroup>
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
                              <button type='button' onClick={(e) => copyToClipboard(e, investor?.companyName ?? '')} className='group'>
                                <CopyIcon className='size-4 hover:cursor-pointer transition-all absolute top-1/2 right-2 -translate-y-1/2 rotate-0 scale-100 group-data-[copied=true]:-rotate-90 group-data-[copied=true]:scale-0' />

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span>
                                      <CheckIcon className='size-4 hover:cursor-pointer transition-all absolute top-1/2 right-2 -translate-y-1/2 rotate-90 scale-0 group-data-[copied=true]:rotate-0 group-data-[copied=true]:scale-100' />
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
                      name='name'
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor={field.name}>{
                            investorType === InvestorType.COMPANY
                              ? 'Nombre de la empresa'
                              : 'Nombre completo'}
                            :
                          </FieldLabel>
                          <InputGroup>
                            <InputGroupInput {...field} aria-invalid={fieldState.invalid} id={field.name} type='text' placeholder={'ACME'} required disabled={isFormDisabled} />
                            <InputGroupAddon>{
                              investorType === InvestorType.COMPANY
                                ? <UsersIcon />
                                : <UserIcon />}
                            </InputGroupAddon>
                            <InputGroupAddon align='inline-end'>
                              <button type='button' onClick={(e) => copyToClipboard(e, investor?.name ?? '')} className='group'>
                                <CopyIcon className='size-4 hover:cursor-pointer transition-all absolute top-1/2 right-2 -translate-y-1/2 rotate-0 scale-100 group-data-[copied=true]:-rotate-90 group-data-[copied=true]:scale-0' />

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span>
                                      <CheckIcon className='size-4 hover:cursor-pointer transition-all absolute top-1/2 right-2 -translate-y-1/2 rotate-90 scale-0 group-data-[copied=true]:rotate-0 group-data-[copied=true]:scale-100' />
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
                              <button type='button' onClick={(e) => copyToClipboard(e, investor?.email ?? '')} className='group'>
                                <CopyIcon className='size-4 hover:cursor-pointer transition-all absolute top-1/2 right-2 -translate-y-1/2 rotate-0 scale-100 group-data-[copied=true]:-rotate-90 group-data-[copied=true]:scale-0' />

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span>
                                      <CheckIcon className='size-4 hover:cursor-pointer transition-all absolute top-1/2 right-2 -translate-y-1/2 rotate-90 scale-0 group-data-[copied=true]:rotate-0 group-data-[copied=true]:scale-100' />
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
                              <button type='button' onClick={(e) => copyToClipboard(e, investor?.phoneNumber ?? '')} className='group'>
                                <CopyIcon className='size-4 hover:cursor-pointer transition-all absolute top-1/2 right-2 -translate-y-1/2 rotate-0 scale-100 group-data-[copied=true]:-rotate-90 group-data-[copied=true]:scale-0' />

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span>
                                      <CheckIcon className='size-4 hover:cursor-pointer transition-all absolute top-1/2 right-2 -translate-y-1/2 rotate-90 scale-0 group-data-[copied=true]:rotate-0 group-data-[copied=true]:scale-100' />
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
                <FieldSet>
                  <FieldGroup className='flex flex-row gap-2 items-center justify-end'>
                    <Button type='button' variant='secondary' onClick={handleReset} disabled={JSON.stringify(originalInvestor) === JSON.stringify(investor) && !form.formState.isDirty}>
                      <RotateCcwIcon />
                      Deshacer
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button disabled={JSON.stringify(originalInvestor) === JSON.stringify(investor) && !form.formState.isDirty}>
                          <SaveIcon />
                          Guardar cambios
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>¿Estás seguro de que deseas guardar los cambios?</DialogTitle>
                        </DialogHeader>
                        <DialogDescription>Esta acción actualizará la información del usuario en el sistema, comprueba siempre que los datos son correctos.</DialogDescription>

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
                                {Object.entries(UPDATE_NOTES_MAP).map(([key, note]) => (
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
                          <Button type='submit' form='investor-form' onClick={form.handleSubmit(onSubmit)}>
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

        <UserChangeHistory investor={investor} />
      </div>

      <Tabs defaultValue={DocumentType.ID} className='gap-4'>
        <TabsList>
          <TabsTrigger value={DocumentType.ID}>Documentos</TabsTrigger>
          <TabsTrigger value={'debtors'}>Deudores</TabsTrigger>
          <TabsTrigger value={DocumentType.INVOICE}>Facturas</TabsTrigger>
          <TabsTrigger value={'auctions'}>Subastas</TabsTrigger>
        </TabsList>
        <TabsContent value={DocumentType.ID}>
          <UserDocuments investorId={investorId} />
        </TabsContent>
        <TabsContent value={'debtors'}>
          <UserDebtors investorId={investorId} />
        </TabsContent>
        <TabsContent value={DocumentType.INVOICE}>
          <UserInvoices investorId={investorId} />
        </TabsContent>
        <TabsContent value={'auctions'}>
          <UserAuctions investorId={investorId} />
        </TabsContent>
      </Tabs>
    </section>
  )
}

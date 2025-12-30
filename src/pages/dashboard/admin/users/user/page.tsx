import {ButtonGroup} from '@/components/ui/button-group.tsx'
import {Button} from '@/components/ui/button.tsx'
import {Field, FieldError, FieldGroup, FieldLabel} from '@/components/ui/field.tsx'
import {Form} from '@/components/ui/form.tsx'
import {InputGroup, InputGroupAddon, InputGroupInput} from '@/components/ui/input-group.tsx'
import {Select, SelectContent, SelectItem, SelectTrigger} from '@/components/ui/select.tsx'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs.tsx'
import {Tooltip, TooltipContent, TooltipTrigger} from '@/components/ui/tooltip.tsx'
import {UserChangeHistory} from '@/pages/dashboard/admin/users/user/user-change-history.tsx'
import UserDocuments from '@/pages/dashboard/admin/users/user/user-documents/user-documents.tsx'
import {getInvestorById} from '@/services/investor.api.ts'
import {DocumentType} from '@/types/Document.ts'
import {type Investor, InvestorStatus, InvestorType} from '@/types/Investor.ts'
import {zodResolver} from '@hookform/resolvers/zod'
import {
  BuildingIcon,
  CheckCheckIcon,
  CheckIcon,
  CircleAlertIcon,
  ClockIcon,
  CopyIcon,
  LockIcon,
  LockOpenIcon,
  MailIcon,
  OctagonXIcon,
  PhoneIcon,
  UserIcon,
  UsersIcon
} from 'lucide-react'
import {useEffect, useState} from 'react'
import {Controller, useForm, useWatch} from 'react-hook-form'
import {useNavigate, useParams} from 'react-router'
import {z} from 'zod'

const formSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  companyName: z.string()
    .min(1, 'La razón social es obligatoria'),
  email: z.email('Correo electrónico no válido'),
  phoneNumber: z.string()
    .min(6, 'El número de teléfono es obligatorio'),
  investorType: z.enum(InvestorType)
})

export default function AdminUserPage () {
  const {investorId} = useParams()
  const [investor, setInvestor] = useState<Investor>({
    id: '',
    email: '',
    name: '',
    type: '',
    phoneNumber: '',
    companyName: '',
    investorType: InvestorType.INDIVIDUAL,
    status: InvestorStatus.PENDING,
    isOptedInNotificationsEmail: false,
    isOptedInNotificationsSMS: false,
    documents: [],
    bankAccount: {
      id: '',
      balance: 0
    }
  })
  const [originalInvestor, setOriginalInvestor] = useState<Investor>(investor)
  const [isFormDisabled, setIsFormDisabled] = useState(true)

  const navigate = useNavigate()
  useEffect(() => {
    if (investorId)
      getInvestorById(investorId)
        .then(res => res.data)
        .then(user => {
          setInvestor(user)
          setOriginalInvestor(user)
        })
        .catch(() => {
          navigate('/admin/users')
        })
  }, [investorId, navigate])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: {
      name: investor.name,
      companyName: investor.companyName,
      email: investor.email,
      phoneNumber: investor.phoneNumber,
      investorType: investor.investorType
    }
  })

  useEffect(() => {
    form.reset({
      name: investor.name,
      companyName: investor.companyName,
      email: investor.email,
      phoneNumber: investor.phoneNumber,
      investorType: investor.investorType
    })
  }, [investor, form])

  const investorType = useWatch({ control: form.control, name: 'investorType' })
  const name = useWatch({ control: form.control, name: 'name' })

  useEffect(() => {
    if (investorType !== InvestorType.COMPANY && name !== form.getValues('companyName')) {
      form.setValue('companyName', name, { shouldValidate: false })
    }
  }, [investorType, name, form])

  function onSubmit (data: z.infer<typeof formSchema>) {
    console.log(data)
  }

  function copyToClipboard (e: React.MouseEvent<HTMLButtonElement>, text: string) {
    e.preventDefault()
    navigator.clipboard.writeText(text)
    const button = e.currentTarget
    button.setAttribute('data-copied', 'true')
    setTimeout(() => {
      button.removeAttribute('data-copied')
    }, 2000)
  }

  return (
    <section className='flex flex-col gap-4'>
      <div className='grid lg:grid-cols-3 gap-4'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='lg:col-span-2 flex flex-col gap-4'>
            <div className='flex flex-col xl:flex-row gap-2'>
              <h3 className='text-lg'>Detalles del usuario {investor.companyName}</h3>
              <ButtonGroup className='xl:ms-auto flex-row-reverse xl:flex-row'>
                <ButtonGroup>
                  {isFormDisabled
                    ? (
                      <Button variant='outline' onClick={() => setIsFormDisabled(false)}>
                        <LockIcon />
                      </Button>
                    ) : (
                      <Button variant='outline' onClick={() => setIsFormDisabled(true)}>
                        <LockOpenIcon />
                      </Button>
                    )}
                </ButtonGroup>

                <ButtonGroup>
                  <Button variant='outline' className='bg-zinc-300/25 dark:bg-zinc-300/10' onClick={() => setInvestor({...investor, status: InvestorStatus.DENIED})}>
                    <OctagonXIcon className='rounded-full text-zinc-600'/>
                    {investor.status === InvestorStatus.DENIED && 'Denegado'}
                  </Button>
                  <Button variant='outline' className='bg-red-300/25 dark:bg-red-300/15' onClick={() => setInvestor({...investor, status: InvestorStatus.CORRECTION})}>
                    <CircleAlertIcon className='w-5 h-5 rounded-full text-red-600'/>
                    {investor.status === InvestorStatus.CORRECTION && 'Corrección requerida'}
                  </Button>
                  <Button variant='outline' className='bg-yellow-300/25 dark:bg-yellow-300/15' onClick={() => setInvestor({...investor, status: InvestorStatus.PENDING})}>
                    <ClockIcon className='w-5 h-5 rounded-full text-yellow-600'/>
                    {investor.status === InvestorStatus.PENDING && 'Por verificar'}
                  </Button>
                  <Button variant='outline' className='bg-green-300/25 dark:bg-green-300/15' onClick={() => setInvestor({...investor, status: InvestorStatus.VERIFIED})}>
                    <CheckCheckIcon className='w-5 h-5 rounded-full text-green-600'/>
                    {investor.status === InvestorStatus.VERIFIED && 'Verificado'}
                  </Button>
                </ButtonGroup>
              </ButtonGroup>
            </div>

            <FieldGroup className='flex flex-col gap-4 xl:grid xl:grid-cols-2'>
              <Field>
                <FieldLabel htmlFor='investorId'>ID</FieldLabel>
                <InputGroup>
                  <InputGroupInput id='investorId' value={investor.id} disabled />
                  <InputGroupAddon align='inline-end'>
                    <button onClick={(e) => copyToClipboard(e, investor.id)} className='group'>
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
              <Controller
                name='investorType'
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Tipo de inversor</FieldLabel>
                    <Select value={field.value || ''} onValueChange={field.onChange} defaultValue={field.value || ''} disabled={isFormDisabled}>
                      <SelectTrigger>
                        {field.value ? (field.value === InvestorType.INDIVIDUAL ? 'Particular' : 'Empresa') : 'Selecciona un tipo'}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={InvestorType.INDIVIDUAL}>
                          <span className='flex items-center gap-2'>
                            <UserIcon className='w-4 h-4' />
                            Particular
                          </span>
                        </SelectItem>
                        <SelectItem value={InvestorType.COMPANY}>
                          <span className='flex items-center gap-2'>
                            <BuildingIcon className='w-4 h-4' />
                            Empresa
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
            </FieldGroup>
            <FieldGroup className='flex flex-col gap-4 xl:grid xl:grid-cols-2'>
              <Controller
                name='companyName'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Razón social</FieldLabel>
                    <InputGroup>
                      <InputGroupInput {...field} aria-invalid={fieldState.invalid} id={field.name} type='text' placeholder='ACME S.L.' required disabled={isFormDisabled} />
                      <InputGroupAddon>
                        <BuildingIcon />
                      </InputGroupAddon>
                      <InputGroupAddon align='inline-end'>
                        <button onClick={(e) => copyToClipboard(e, investor.companyName)} className='group'>
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
                name='name'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>{
                      investorType === InvestorType.COMPANY
                        ? 'Nombre de la empresa'
                        : 'Nombre completo'}
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupInput {...field} aria-invalid={fieldState.invalid} id={field.name} type='text' placeholder={'ACME'} required disabled={isFormDisabled} />
                      <InputGroupAddon>{
                        investorType === InvestorType.COMPANY
                          ? <UsersIcon />
                          : <UserIcon />}
                      </InputGroupAddon>
                      <InputGroupAddon align='inline-end'>
                        <button onClick={(e) => copyToClipboard(e, investor.name)} className='group'>
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
                    <FieldLabel htmlFor={field.name}>Correo</FieldLabel>
                    <InputGroup>
                      <InputGroupInput {...field} aria-invalid={fieldState.invalid} id={field.name} type='email' placeholder='m@example.com' required disabled={isFormDisabled} />
                      <InputGroupAddon>
                        <MailIcon />
                      </InputGroupAddon>
                      <InputGroupAddon align='inline-end'>
                        <button onClick={(e) => copyToClipboard(e, investor.email)} className='group'>
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
                    <FieldLabel htmlFor={field.name}>Número de teléfono</FieldLabel>
                    <InputGroup>
                      <InputGroupInput {...field} aria-invalid={fieldState.invalid} id={field.name} type='tel' placeholder='654987321' required disabled={isFormDisabled}/>
                      <InputGroupAddon>
                        <PhoneIcon />
                      </InputGroupAddon>
                      <InputGroupAddon align='inline-end'>
                        <button onClick={(e) => copyToClipboard(e, investor.phoneNumber)} className='group'>
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
            <FieldGroup>
              <Button type='submit' className='ms-auto w-min' disabled={JSON.stringify(originalInvestor) === JSON.stringify(investor) && !form.formState.isDirty}>
                Guardar cambios
              </Button>
            </FieldGroup>
          </form>
        </Form>

        <UserChangeHistory />
      </div>
      <Tabs defaultValue={DocumentType.IDENTIFICATION} className='gap-4'>
        <TabsList>
          <TabsTrigger value={DocumentType.IDENTIFICATION}>Documentos</TabsTrigger>
          <TabsTrigger value={DocumentType.INVOICE}>Facturas</TabsTrigger>
        </TabsList>
        <TabsContent value={DocumentType.IDENTIFICATION}>
          <UserDocuments investorId={investorId} />
        </TabsContent>
        <TabsContent value={DocumentType.INVOICE}>
          Facturas...
        </TabsContent>
      </Tabs>
    </section>
  )
}

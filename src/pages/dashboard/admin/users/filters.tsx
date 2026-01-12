import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent } from '@/components/ui/card.tsx'
import { Checkbox } from '@/components/ui/checkbox.tsx'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field.tsx'
import { Form } from '@/components/ui/form.tsx'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group.tsx'
import { Label } from '@/components/ui/label.tsx'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select.tsx'
import { InvestorStatus, InvestorType } from '@/types/User'
import {
  BuildingIcon,
  CheckCheckIcon,
  CircleAlertIcon,
  ClockIcon,
  IdCardIcon,
  MailIcon,
  OctagonXIcon,
  PhoneIcon,
  UserIcon
} from 'lucide-react'
import { Controller, type UseFormReturn } from 'react-hook-form'

export default function UserFilters (
  { form, onSubmit, handleClear }:
  {
    form: UseFormReturn<{
      email?: string | undefined
      name?: string | undefined
      companyName?: string | undefined
      phoneNumber?: string | undefined
      documentValue?: string | undefined
      investorType?: InvestorType | undefined
      status?: InvestorStatus | undefined
      includeDeleted?: boolean | undefined
    }>,
    onSubmit: (data: {
      email?: string | undefined
      name?: string | undefined
      companyName?: string | undefined
      phoneNumber?: string | undefined
      documentValue?: string | undefined
      investorType?: InvestorType | undefined
      status?: InvestorStatus | undefined
      includeDeleted?: boolean | undefined
    }) => void,
    handleClear: () => void
  }) {
  return (
    <Card>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4'>
            <FieldGroup className='grid md:grid-cols-2 xl:grid-cols-4 gap-4'>
              <Controller
                name='companyName'
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Razón social</FieldLabel>
                    <InputGroup>
                      <InputGroupInput {...field} id={field.name} type='text' placeholder='Empresa S.L.' autoComplete='off'/>
                      <InputGroupAddon>
                        <BuildingIcon />
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>
                )}
              />
              <Controller
                name='name'
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
                    <InputGroup>
                      <InputGroupInput {...field} id={field.name} type='text' placeholder='John Doe' autoComplete='off'/>
                      <InputGroupAddon>
                        <UserIcon />
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>
                )}
              />
              <Controller
                name='email'
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Correo</FieldLabel>
                    <InputGroup>
                      <InputGroupInput {...field} id={field.name} type='text' placeholder='m@example.com' autoComplete='off'/>
                      <InputGroupAddon>
                        <MailIcon />
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>
                )}
              />
              <Controller
                name='phoneNumber'
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Teléfono</FieldLabel>
                    <InputGroup>
                      <InputGroupInput {...field} id={field.name} type='text' placeholder='34 600 000 000' autoComplete='off'/>
                      <InputGroupAddon>
                        <PhoneIcon />
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>
                )}
              />
              <Controller
                name='documentValue'
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>CIF/NIF</FieldLabel>
                    <InputGroup>
                      <InputGroupInput {...field} id={field.name} type='text' placeholder='12345678A' autoComplete='off'/>
                      <InputGroupAddon>
                        <IdCardIcon/>
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>
                )}
              />
              <Controller
                name='investorType'
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Tipo de inversor</FieldLabel>
                    <Select value={field.value || ''} onValueChange={field.onChange} defaultValue={field.value || ''}>
                      <SelectTrigger>
                        {field.value ?
                          (
                            field.value === InvestorType.INDIVIDUAL
                              ? (
                                <span className='flex items-center gap-2'>
                                  <UserIcon className='w-4 h-4' />
                                  Particular
                                </span>
                              ) : (
                                <span className='flex items-center gap-2'>
                                  <BuildingIcon className='w-4 h-4' />
                                  Empresa
                                </span>
                              )
                          ) : (
                            'Selecciona un tipo'
                          )}
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
              <Controller
                name='status'
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Estado</FieldLabel>
                    <Select value={field.value || ''} onValueChange={field.onChange} defaultValue={field.value || ''} >
                      <SelectTrigger>
                        {field.value ? (
                          field.value === InvestorStatus.PENDING ? (
                            <span className='flex items-center gap-1'>
                              <ClockIcon className='w-5 h-5 rounded-full text-yellow-600 bg-yellow-300/25 p-0.5'/>
                              Por verificar
                            </span>
                          ) : field.value === InvestorStatus.VERIFIED ? (
                            <span className='flex items-center gap-2'>
                              <CheckCheckIcon className='w-5 h-5 rounded-full text-green-600 bg-green-300/25 p-0.5'/>
                              Verificado
                            </span>
                          ) : field.value === InvestorStatus.CORRECTION ? (
                            <span className='flex items-center gap-2'>
                              <CircleAlertIcon className='w-5 h-5 rounded-full text-red-600 bg-red-300/25 p-0.5'/>
                              Corrección requerida
                            </span>
                          ) : (
                            <span className='flex items-center gap-2'>
                              <OctagonXIcon className='w-5 h-5 rounded-full text-zinc-600 bg-zinc-300/25 p-0.5'/>
                              Denegado
                            </span>
                          )
                        ) : (
                          'Selecciona un estado'
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={InvestorStatus.PENDING}>
                          <span className='flex items-center gap-1'>
                            <ClockIcon className='w-5 h-5 rounded-full text-yellow-600 bg-yellow-300/25 p-0.5'/>
                            Por verificar
                          </span>
                        </SelectItem>
                        <SelectItem value={InvestorStatus.VERIFIED}>
                          <span className='flex items-center gap-2'>
                            <CheckCheckIcon className='w-5 h-5 rounded-full text-green-600 bg-green-300/25 p-0.5'/>
                            Verificado
                          </span>
                        </SelectItem>
                        <SelectItem value={InvestorStatus.CORRECTION}>
                          <span className='flex items-center gap-2'>
                            <CircleAlertIcon className='w-5 h-5 rounded-full text-red-600 bg-red-300/25 p-0.5'/>
                            Corrección requerida
                          </span>
                        </SelectItem>
                        <SelectItem value={InvestorStatus.DENIED}>
                          <span className='flex items-center gap-2'>
                            <OctagonXIcon className='w-5 h-5 rounded-full text-zinc-600 bg-zinc-300/25 p-0.5'/>
                            Denegado
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
              <Controller
                name='includeDeleted'
                control={form.control}
                render={({ field }) => (
                  <Label className='h-min self-end hover:bg-accent/50 flex items-start gap-3 rounded-md border p-2.5 has-aria-checked:border-primary/75 has-aria-checked:bg-primary/10 dark:has-aria-checked:border-primary/50 dark:has-aria-checked:bg-primary/20'>
                    <Checkbox
                      id='toggle-include-deleted'
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className='data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700'
                    />
                    <div className='grid gap-1.5 font-normal'>
                      <p className='text-sm leading-none font-medium'>
                        Incluir usuarios eliminados
                      </p>
                    </div>
                  </Label>
                )}
              />
            </FieldGroup>
            <div className='justify-end items-end flex gap-2'>
              <Button type='submit'>Filtrar</Button>
              <Button type='button' variant='outline' onClick={handleClear}>Limpiar</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

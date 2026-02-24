import StatusBadge from '@/components/status-badge'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent } from '@/components/ui/card.tsx'
import { Checkbox } from '@/components/ui/checkbox.tsx'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field.tsx'
import { Form } from '@/components/ui/form.tsx'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group.tsx'
import { Label } from '@/components/ui/label.tsx'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select.tsx'
import { InvestorStatus, InvestorType } from '@/types/User'
import {
  BuildingIcon,
  IdCardIcon,
  MailIcon,
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
      phoneNumber?: number | undefined
      taxId?: string | undefined
      investorType?: InvestorType | undefined
      status?: InvestorStatus | undefined
      includeDeleted?: boolean | undefined
    }>,
    onSubmit: (data: {
      email?: string | undefined
      name?: string | undefined
      companyName?: string | undefined
      phoneNumber?: number | undefined
      taxId?: string | undefined
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
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Razón social</FieldLabel>
                    <InputGroup>
                      <InputGroupInput {...field} id={field.name} type='text' placeholder='Empresa S.L.' autoComplete='off'/>
                      <InputGroupAddon>
                        <BuildingIcon />
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
                  <Field>
                    <FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
                    <InputGroup>
                      <InputGroupInput {...field} id={field.name} type='text' placeholder='John Doe' autoComplete='off'/>
                      <InputGroupAddon>
                        <UserIcon />
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
                  <Field>
                    <FieldLabel htmlFor={field.name}>Correo</FieldLabel>
                    <InputGroup>
                      <InputGroupInput {...field} id={field.name} type='text' placeholder='m@example.com' autoComplete='off'/>
                      <InputGroupAddon>
                        <MailIcon />
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
                  <Field>
                    <FieldLabel htmlFor={field.name}>Teléfono</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        id={field.name}
                        type='number'
                        placeholder='34 600 000 000'
                        autoComplete='off'
                      />
                      <InputGroupAddon>
                        <PhoneIcon />
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name='taxId'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>CIF/NIF</FieldLabel>
                    <InputGroup>
                      <InputGroupInput {...field} id={field.name} type='text' placeholder='12345678A' autoComplete='off'/>
                      <InputGroupAddon>
                        <IdCardIcon />
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
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Tipo de inversor</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => field.onChange(value === '__NONE__' ? '' : value)}
                      defaultValue={field.value || '__NONE__'}
                    >
                      <SelectTrigger className='grow'>
                        {field.value ?
                          (
                            field.value === InvestorType.INDIVIDUAL
                              ? (
                                <span className='flex items-center gap-2'>
                                  <UserIcon className='w-4 h-4' />
                                  Particular
                                </span>
                              ) : field.value === InvestorType.COMPANY ? (
                                <span className='flex items-center gap-2'>
                                  <BuildingIcon className='w-4 h-4' />
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
                        <SelectItem value='__NONE__'>
                          <button
                            type='button'
                            onClick={() => field.onChange(undefined)}
                            className='w-full text-sm text-left'
                          >
                            Selecciona un tipo
                          </button>
                        </SelectItem>
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
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name='status'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Estado</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => field.onChange(value === '__NONE__' ? '' : value)}
                      defaultValue={field.value || '__NONE__'}
                    >
                      <SelectTrigger className='grow'>
                        {field.value ? (
                          field.value === InvestorStatus.PENDING ? (
                            <StatusBadge status='pending' />
                          ) : field.value === InvestorStatus.VERIFIED ? (
                            <StatusBadge status='verified' />
                          ) : field.value === InvestorStatus.CORRECTION ? (
                            <StatusBadge status='correction' />
                          ) : field.value === InvestorStatus.DENIED ? (
                            <StatusBadge status='denied' />
                          ) : (
                            <span className='flex items-center gap-2'>
                              {field.value}
                            </span>
                          )
                        ) : (
                          'Selecciona un estado'
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='__NONE__'>
                          <button
                            type='button'
                            onClick={() => field.onChange(undefined)}
                            className='w-full text-sm text-left'
                          >
                            Selecciona un estado
                          </button>
                        </SelectItem>
                        <SelectItem value={InvestorStatus.PENDING}>
                          <StatusBadge status='pending' />
                        </SelectItem>
                        <SelectItem value={InvestorStatus.VERIFIED}>
                          <StatusBadge status='verified' />
                        </SelectItem>
                        <SelectItem value={InvestorStatus.CORRECTION}>
                          <StatusBadge status='correction' />
                        </SelectItem>
                        <SelectItem value={InvestorStatus.DENIED}>
                          <StatusBadge status='denied' />
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
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
                      checked={field.value ?? false}
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
              <div className='md:col-start-2 xl:col-start-4 justify-end items-end flex gap-2'>
                <Button type='submit'>Filtrar</Button>
                <Button type='button' variant='outline' onClick={handleClear}>Limpiar</Button>
              </div>
            </FieldGroup>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

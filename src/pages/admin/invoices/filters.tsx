import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Form } from '@/components/ui/form'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { InvoiceStatus } from '@/types/Invoice'
import { BuildingIcon, CheckCheckIcon, CircleAlertIcon, ClockIcon, OctagonXIcon } from 'lucide-react'
import { Controller, type UseFormReturn } from 'react-hook-form'

export default function InvoiceFilters (
  { form, onSubmit, handleClear }: {
    form: UseFormReturn<{
      sellerCompanyName?: string | undefined;
      buyerCompanyName?: string | undefined;
      debtorCompanyName?: string | undefined;
      maxAmount?: number | undefined;
      minAmount?: number | undefined;
      minRating?: number | undefined;
      dueDateFrom?: string | undefined;
      dueDateTo?: string | undefined;
      status?: InvoiceStatus | undefined;
      isSold?: boolean | undefined;
      includeDeleted?: boolean | undefined;
    }>;
    onSubmit: (data: {
      sellerCompanyName?: string | undefined;
      buyerCompanyName?: string | undefined;
      debtorCompanyName?: string | undefined;
      maxAmount?: number | undefined;
      minAmount?: number | undefined;
      minRating?: number | undefined;
      dueDateFrom?: string | undefined;
      dueDateTo?: string | undefined;
      status?: InvoiceStatus | undefined;
      isSold?: boolean | undefined;
      includeDeleted?: boolean | undefined;
    }) => void;
    handleClear: () => void;
    }) {
  return (
    <Card>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4'>
            <FieldGroup className='grid md:grid-cols-2 xl:grid-cols-4 gap-4'>
              <Controller
                name='sellerCompanyName'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Razón social vendedor</FieldLabel>
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
                name='buyerCompanyName'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Razón social comprador</FieldLabel>
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
                name='debtorCompanyName'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Razón social deudor</FieldLabel>
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
                name='dueDate'
                control={form.control}
                render={() => (
                  <Field>
                    <FieldLabel>Fecha de vencimiento</FieldLabel>
                    <DateRangePicker
                      fromDate={form.watch('dueDateFrom')}
                      toDate={form.watch('dueDateTo')}
                      onFromChange={(dateStr) => form.setValue('dueDateFrom', dateStr)}
                      onToChange={(dateStr) => form.setValue('dueDateTo', dateStr)}
                    />
                  </Field>
                )}
              />
              <div className='flex gap-2'>
                <Controller
                  name='minAmount'
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Importe mínimo</FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                          id={field.name}
                          type='number'
                          placeholder='1000'
                          autoComplete='off'
                          min={0}
                          step={0.01}
                        />
                        <InputGroupAddon>
                          €
                        </InputGroupAddon>
                      </InputGroup>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name='maxAmount'
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Importe máximo</FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                          id={field.name}
                          type='number'
                          placeholder='10000'
                          autoComplete='off'
                          min={0}
                          step={0.01}
                        />
                        <InputGroupAddon>
                          €
                        </InputGroupAddon>
                      </InputGroup>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
              <Controller
                name='status'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Estado</FieldLabel>
                    <Select value={field.value || ''} onValueChange={field.onChange} defaultValue={field.value || ''} >
                      <SelectTrigger>
                        {field.value ? (
                          field.value === InvoiceStatus.PENDING ? (
                            <span className='flex items-center gap-1'>
                              <ClockIcon className='w-5 h-5 rounded-full text-yellow-600 bg-yellow-300/25 p-0.5'/>
                              Por verificar
                            </span>
                          ) : field.value === InvoiceStatus.VERIFIED ? (
                            <span className='flex items-center gap-2'>
                              <CheckCheckIcon className='w-5 h-5 rounded-full text-green-600 bg-green-300/25 p-0.5'/>
                              Verificado
                            </span>
                          ) : field.value === InvoiceStatus.CORRECTION ? (
                            <span className='flex items-center gap-2'>
                              <CircleAlertIcon className='w-5 h-5 rounded-full text-red-600 bg-red-300/25 p-0.5'/>
                              Corrección requerida
                            </span>
                          ) : field.value === InvoiceStatus.DENIED ? (
                            <span className='flex items-center gap-2'>
                              <OctagonXIcon className='w-5 h-5 rounded-full text-zinc-600 bg-zinc-300/25 p-0.5'/>
                              Denegado
                            </span>
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
                        <SelectItem>
                          <button
                            type='button'
                            onClick={() => field.onChange(undefined)}
                            className='w-full text-sm text-left'
                          >
                            Selecciona un estado
                          </button>
                        </SelectItem>
                        <SelectItem value={InvoiceStatus.PENDING}>
                          <span className='flex items-center gap-1'>
                            <ClockIcon className='w-5 h-5 rounded-full text-yellow-600 bg-yellow-300/25 p-0.5'/>
                            Por verificar
                          </span>
                        </SelectItem>
                        <SelectItem value={InvoiceStatus.VERIFIED}>
                          <span className='flex items-center gap-2'>
                            <CheckCheckIcon className='w-5 h-5 rounded-full text-green-600 bg-green-300/25 p-0.5'/>
                            Verificado
                          </span>
                        </SelectItem>
                        <SelectItem value={InvoiceStatus.CORRECTION}>
                          <span className='flex items-center gap-2'>
                            <CircleAlertIcon className='w-5 h-5 rounded-full text-red-600 bg-red-300/25 p-0.5'/>
                            Corrección requerida
                          </span>
                        </SelectItem>
                        <SelectItem value={InvoiceStatus.DENIED}>
                          <span className='flex items-center gap-2'>
                            <OctagonXIcon className='w-5 h-5 rounded-full text-zinc-600 bg-zinc-300/25 p-0.5'/>
                            Denegado
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
                name='isSold'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className='self-end'>
                    <Label className='h-min hover:bg-accent/50 flex items-start gap-3 border p-2.5 has-aria-checked:border-primary/75 has-aria-checked:bg-primary/10 dark:has-aria-checked:border-primary/50 dark:has-aria-checked:bg-primary/20'>
                      <Checkbox
                        id='toggle-include-deleted'
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        className='data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700'
                      />
                      <div className='grid gap-1.5 font-normal'>
                        <p className='text-sm leading-none font-medium'>
                          Solo vendidas
                        </p>
                      </div>
                    </Label>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              {/* <Controller
                name='includeDeleted'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className='self-end'>
                  <Label className='h-min hover:bg-accent/50 flex items-start gap-3 border p-2.5 has-aria-checked:border-primary/75 has-aria-checked:bg-primary/10 dark:has-aria-checked:border-primary/50 dark:has-aria-checked:bg-primary/20'>
                    <Checkbox
                      id='toggle-include-deleted'
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className='data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700'
                    />
                    <div className='grid gap-1.5 font-normal'>
                      <p className='text-sm leading-none font-medium'>
                        Incluir deudores eliminados
                      </p>
                    </div>
                  </Label>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
                )}
              /> */}
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

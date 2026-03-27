import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DateTimeRangePicker } from '@/components/ui/date-time-range-picker'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Form } from '@/components/ui/form'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { ShieldCheckIcon } from 'lucide-react'
import { Controller, type UseFormReturn } from 'react-hook-form'

export default function AuctionFilters (
  { form, onSubmit, handleClear }: {
    form: UseFormReturn<{
      auctionDateStart?: string | undefined;
      auctionDateEnd?: string | undefined;
      minAmount?: number | undefined;
      maxAmount?: number | undefined;
      minRating?: number | undefined;
      minDiscount?: number | undefined;
      minProfitability?: number | undefined;
    }>,
    onSubmit: (data: {
      auctionDateStart?: string | undefined;
      auctionDateEnd?: string | undefined;
      minAmount?: number | undefined;
      maxAmount?: number | undefined;
      minRating?: number | undefined;
      minDiscount?: number | undefined;
      minProfitability?: number | undefined;
    }) => void;
    handleClear: () => void;
  }
) {
  return (
    <Card>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup className='grid grid-cols-1 md:grid-cols-4 2xl:grid-cols-8 gap-4'>
              <Field className='md:col-span-2'>
                <FieldLabel>Rango de fechas</FieldLabel>
                <DateTimeRangePicker
                  fromValue={form.watch('auctionDateStart')}
                  toValue={form.watch('auctionDateEnd')}
                  onFromChange={(isoStr) => form.setValue('auctionDateStart', isoStr, { shouldValidate: true })}
                  onToChange={(isoStr) => form.setValue('auctionDateEnd', isoStr, { shouldValidate: true })}
                  minDate={new Date().toISOString()}
                />
              </Field>
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
                      <InputGroupAddon>€</InputGroupAddon>
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
                      <InputGroupAddon>€</InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name='minRating'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Rating mínimo</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        id={field.name}
                        type='number'
                        placeholder='4.75'
                        autoComplete='off'
                        min={0}
                        max={5}
                        step={0.01}
                      />
                      <InputGroupAddon>
                        <ShieldCheckIcon className='w-4 h-4' />
                      </InputGroupAddon>
                      <InputGroupAddon align='inline-end'>
                        /5
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name='minDiscount'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Descuento mínimo</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        id={field.name}
                        type='number'
                        placeholder='0'
                        autoComplete='off'
                        min={0}
                        max={100}
                        step={0.1}
                      />
                      <InputGroupAddon>%</InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name='minProfitability'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Rentabilidad mínima</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        id={field.name}
                        type='number'
                        placeholder='0'
                        autoComplete='off'
                        min={0}
                        max={100}
                        step={0.1}
                      />
                      <InputGroupAddon>%</InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <div className='xl:col-start-4 2xl:col-start-8 justify-end items-end flex gap-2'>
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

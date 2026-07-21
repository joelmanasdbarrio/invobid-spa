import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Form } from '@/components/ui/form'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { ShieldCheckIcon } from 'lucide-react'
import { Controller, type UseFormReturn } from 'react-hook-form'

type FilterValues = {
  invoiceSvc?: string | undefined;
  debtorCompanyName?: string | undefined;
  sellerCompanyName?: string | undefined;
  minAmount?: number | undefined;
  maxAmount?: number | undefined;
  dueDateFrom?: string | undefined;
  dueDateTo?: string | undefined;
  minRating?: number | undefined;
  minDiscount?: number | undefined;
  minProfitability?: number | undefined;
}

export default function MarketplaceInvoiceFilters (
  { form, onSubmit, handleClear }: {
    form: UseFormReturn<FilterValues>;
    onSubmit: (data: FilterValues) => void;
    handleClear: () => void;
  }
) {
  return (
    <Card>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup className='grid md:grid-cols-4 xl:grid-cols-8 gap-4'>
              <Controller
                name='invoiceSvc'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className='md:col-span-2'>
                    <FieldLabel htmlFor={field.name}>CSV de la factura</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        type='text'
                        placeholder='B12345678-F001-00001234-20260216-A9K3'
                        autoComplete='off'
                      />
                    </InputGroup>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name='debtorCompanyName'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className='md:col-span-2'>
                    <FieldLabel htmlFor={field.name}>Razón social deudor</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        type='text'
                        placeholder='Empresa S.L.'
                        autoComplete='off'
                      />
                    </InputGroup>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name='sellerCompanyName'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className='md:col-span-2'>
                    <FieldLabel htmlFor={field.name}>Razón social cedente</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        type='text'
                        placeholder='Empresa S.L.'
                        autoComplete='off'
                      />
                    </InputGroup>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Field className='md:col-span-2'>
                <FieldLabel>Fecha de vencimiento</FieldLabel>
                <DateRangePicker
                  fromDate={form.watch('dueDateFrom')}
                  toDate={form.watch('dueDateTo')}
                  onFromChange={(dateStr) => form.setValue('dueDateFrom', dateStr)}
                  onToChange={(dateStr) => form.setValue('dueDateTo', dateStr)}
                />
              </Field>
              <Controller
                name='minAmount'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
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
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name='maxAmount'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
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
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name='minDiscount'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
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
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name='minProfitability'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
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
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name='minRating'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
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
                        <ShieldCheckIcon className='size-4' />
                      </InputGroupAddon>
                      <InputGroupAddon align='inline-end'>/5</InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <div className='md:col-start-4 xl:col-start-8 justify-end items-end flex gap-2'>
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

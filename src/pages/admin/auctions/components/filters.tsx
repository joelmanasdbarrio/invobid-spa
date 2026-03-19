import ColorBadge from '@/components/color-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Form } from '@/components/ui/form'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { AuctionStatus } from '@/types/Auction'
import { BuildingIcon, CircleCheckIcon, CircleDashedIcon, CircleGaugeIcon, CirclePauseIcon, CircleSlashIcon, GavelIcon } from 'lucide-react'
import { Controller, type UseFormReturn } from 'react-hook-form'

export default function AuctionFilters (
  { form, onSubmit, handleClear }: {
    form: UseFormReturn<{
    sellerCompanyName?: string | undefined;
    buyerCompanyName?: string | undefined;
    debtorCompanyName?: string | undefined;
    invoiceId?: string | undefined;
    maxAmount?: number | undefined;
    minAmount?: number | undefined;
    auctionDateStart?: string | undefined;
    auctionDateEnd?: string | undefined;
    status?: AuctionStatus | undefined;
    includeDeleted?: boolean | undefined;
}>,
    onSubmit: (data: {
      sellerCompanyName?: string | undefined;
    buyerCompanyName?: string | undefined;
    debtorCompanyName?: string | undefined;
    invoiceId?: string | undefined;
    maxAmount?: number | undefined;
    minAmount?: number | undefined;
    auctionDateStart?: string | undefined;
    auctionDateEnd?: string | undefined;
    status?: AuctionStatus | undefined;
    includeDeleted?: boolean | undefined;
    }) => void;
    handleClear: () => void;
  }
) {
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
                    <FieldLabel htmlFor={field.name}>Razón social del cedente</FieldLabel>
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
                    <FieldLabel htmlFor={field.name}>Razón social del inversor</FieldLabel>
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
                    <FieldLabel htmlFor={field.name}>Razón social del deudor</FieldLabel>
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
                name='status'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Estado</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => field.onChange(value)}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        {field.value ? (
                          field.value === AuctionStatus.DRAFT ? (
                            <ColorBadge color='yellow' icon={<CircleDashedIcon />}>
                              Borrador
                            </ColorBadge>
                          ) : field.value === AuctionStatus.PUBLISHED ? (
                            <ColorBadge color='green' icon={<CircleCheckIcon />}>
                              Publicada
                            </ColorBadge>
                          ) : field.value === AuctionStatus.LIVE ? (
                            <ColorBadge color='blue' icon={<CircleGaugeIcon/>}>
                              En curso
                            </ColorBadge>
                          ) : field.value === AuctionStatus.PAUSED ? (
                            <ColorBadge color='slate' icon={<CirclePauseIcon />}>
                              Pausada
                            </ColorBadge>
                          ) : field.value === AuctionStatus.CANCELLED ? (
                            <ColorBadge color='red' icon={<CircleSlashIcon />}>
                              Cancelada
                            </ColorBadge>
                          ) : field.value === AuctionStatus.FINISHED ? (
                            <ColorBadge color='purple' icon={<GavelIcon />}>
                              Finalizada
                            </ColorBadge>
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
                        <SelectItem value={AuctionStatus.DRAFT}>
                          <ColorBadge color='yellow' icon={<CircleDashedIcon />}>
                            Borrador
                          </ColorBadge>
                        </SelectItem>
                        <SelectItem value={AuctionStatus.PUBLISHED}>
                          <ColorBadge color='green' icon={<CircleCheckIcon />}>
                            Publicada
                          </ColorBadge>
                        </SelectItem>
                        <SelectItem value={AuctionStatus.LIVE}>
                          <ColorBadge color='blue' icon={<CircleGaugeIcon />}>
                            En curso
                          </ColorBadge>
                        </SelectItem>
                        <SelectItem value={AuctionStatus.PAUSED}>
                          <ColorBadge color='slate' icon={<CirclePauseIcon />}>
                            Pausada
                          </ColorBadge>
                        </SelectItem>
                        <SelectItem value={AuctionStatus.CANCELLED}>
                          <ColorBadge color='red' icon={<CircleSlashIcon />}>
                            Cancelada
                          </ColorBadge>
                        </SelectItem>
                        <SelectItem value={AuctionStatus.FINISHED}>
                          <ColorBadge color='purple' icon={<GavelIcon />}>
                            Finalizada
                          </ColorBadge>
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
                name='auctionDateStart'
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Fecha inicio</FieldLabel>
                    <DatePicker
                      id={field.name}
                      value={field.value}
                      onChange={(dateStr) => {
                        field.onChange(dateStr)
                        form.trigger('auctionDateStart')
                      }}
                    />
                  </Field>
                )}
              />
              <Controller
                name='auctionDateEnd'
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Fecha fin</FieldLabel>
                    <DatePicker
                      id={field.name}
                      value={field.value}
                      onChange={(dateStr) => {
                        field.onChange(dateStr)
                        form.trigger('auctionDateEnd')
                      }}
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

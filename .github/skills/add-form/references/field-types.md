# Field Type Reference

All special field types for the `add-form` skill.

## Select

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'

<Controller
  name='investorType'
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>Tipo de inversor</FieldLabel>
      <Select
        value={field.value}
        onValueChange={(value) => field.onChange(value === '__NONE__' ? '' : value)}
        defaultValue={field.value || '__NONE__'}
      >
        <SelectTrigger className='grow' aria-invalid={fieldState.invalid}>
          {field.value ? field.value : 'Selecciona una opción'}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='__NONE__'>Selecciona una opción</SelectItem>
          <SelectItem value={InvestorType.INDIVIDUAL}>Particular</SelectItem>
          <SelectItem value={InvestorType.COMPANY}>Empresa</SelectItem>
        </SelectContent>
      </Select>
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>
```

`'__NONE__'` is the convention for "no selection" — Radix Select requires a non-empty string for `value`.

---

## DatePicker (date only)

```tsx
import { DatePicker } from '@/components/ui/date-picker'
import { parseLocalDate, toDateOnlyString } from '@/lib/format-date'

// Schema: z.date({ invalid_type_error: 'La fecha no es válida' })

<Controller
  name='dueDate'
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>Fecha de vencimiento</FieldLabel>
      <DatePicker
        id={field.name}
        value={field.value instanceof Date ? toDateOnlyString(field.value) : ''}
        minDate={new Date().toISOString().split('T')[0]}
        onChange={(dateStr) => {
          field.onChange(dateStr ? parseLocalDate(dateStr) : undefined)
          form.trigger('dueDate')   // trigger validation manually after date change
        }}
      />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>
```

- `DatePicker` accepts/emits `string` (`'YYYY-MM-DD'`) via `value`/`onChange`
- Always store as `z.date()` in schema; use `parseLocalDate` / `toDateOnlyString` from `@/lib/format-date`
- Always call `form.trigger('fieldName')` manually after a date change
- **Never** use `new Date('YYYY-MM-DD')` directly — causes UTC off-by-one for users west of UTC

---

## DateTimePicker (timestamp)

Same pattern as DatePicker but emits a full ISO string. Use for fields that store date + time.

```tsx
import { DateTimePicker } from '@/components/ui/date-time-picker'

onChange={(isoString) => {
  field.onChange(isoString ? new Date(isoString) : undefined)
  form.trigger('fieldName')
}}
```

---

## File Upload

```tsx
// Schema:
file: z.custom<FileList>()
  .refine((files) => files && files.length > 0, 'El documento es obligatorio')
  .refine((files) => files?.[0]?.size > 0, 'El documento no puede estar vacío')

// Field — do NOT spread {...field}, onChange signature differs for file inputs:
<Controller
  name='file'
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>Documento</FieldLabel>
      <InputGroup>
        <InputGroupInput
          aria-invalid={fieldState.invalid}
          id={field.name}
          ref={field.ref}
          onBlur={field.onBlur}
          onChange={(e) => field.onChange(e.target.files)}   // pass FileList, not File
          type='file'
          accept='image/jpg,image/jpeg,image/png,.pdf'
          className='pt-1.5'
        />
        <InputGroupAddon><FileIcon /></InputGroupAddon>
      </InputGroup>
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>
```

On submit: `formData.append('file', data.file[0])` — extract `File` from `FileList`.

---

## Checkbox

```tsx
import { Checkbox } from '@/components/ui/checkbox'

<Controller
  name='rememberMe'
  control={form.control}
  render={({ field }) => (
    <Field className='flex flex-row gap-2 items-end w-min'>
      <FieldLabel htmlFor={field.name}>Recuérdame</FieldLabel>
      <Checkbox
        id={field.name}
        checked={field.value}
        onCheckedChange={field.onChange}
        className='w-4! h-4!'
      />
    </Field>
  )}
/>
```

---

## Number Input

```tsx
// Schema: z.coerce.number({ invalid_type_error: 'Introduce un número válido' })

// Do NOT spread {...field} — need manual value/onChange for numeric rounding:
<Controller
  name='amount'
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>Importe (€)</FieldLabel>
      <InputGroup>
        <InputGroupInput
          name={field.name}
          id={field.name}
          ref={field.ref}
          type='number'
          step='0.01'
          placeholder='1000'
          value={field.value ?? ''}
          onChange={(e) => field.onChange(e.target.valueAsNumber)}
          onBlur={() => {
            if (field.value !== undefined && !isNaN(field.value)) {
              field.onChange(Math.round(field.value * 100) / 100)
            }
            field.onBlur()
          }}
          aria-invalid={fieldState.invalid}
        />
        <InputGroupAddon>€</InputGroupAddon>
      </InputGroup>
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>
```

---

## Textarea

```tsx
import { InputGroupTextarea } from '@/components/ui/input-group'

<Controller
  name='notes'
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>Notas</FieldLabel>
      <InputGroup>
        <InputGroupTextarea
          {...field}
          id={field.name}
          aria-invalid={fieldState.invalid}
          placeholder='...'
          rows={4}
        />
      </InputGroup>
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>
```

---

## Programmatic setValue (e.g., status buttons outside the form)

```tsx
<Button
  type='button'
  onClick={() => form.setValue('status', MyEnum.VERIFIED, { shouldDirty: true })}
>
  Verificar
</Button>
```

Pass `{ shouldDirty: true }` so `form.formState.isDirty` reflects the change.

---

## useWatch (reactive field values)

```tsx
import { useWatch } from 'react-hook-form'

const investorType = useWatch({ control: form.control, name: 'investorType' })

// Drive side effects based on watched value:
useEffect(() => {
  if (investorType === InvestorType.INDIVIDUAL) {
    form.setValue('companyName', '', { shouldValidate: false })
  }
}, [investorType, form])
```

---

## Layout Components Summary

| Component | Element | Usage |
|-----------|---------|-------|
| `<FieldGroup>` | `<div>` | Flex/grid wrapper for multiple fields |
| `<Field>` | `<div role="group">` | Single field wrapper — add `data-invalid` |
| `<FieldLabel>` | `<label>` | Field label — use `htmlFor={field.name}` |
| `<FieldError>` | `<div role="alert">` | Error message — pass `errors={[fieldState.error]}` |
| `<FieldDescription>` | `<p>` | Muted helper text below input |
| `<FieldSeparator>` | visual divider | "or" separator between field groups |

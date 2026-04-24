---
name: add-form
description: 'Use when: adding a new form to invobid-spa. Scaffolds the react-hook-form + zod + Controller + Field pattern. Covers create forms (JSON body or FormData), edit forms (pre-populated + reset), and all field types (text, select, date, file, checkbox, number, textarea).'
argument-hint: 'Describe the form: what it creates/edits, which fields it needs, and which service function it calls'
---

# Add Form

## When to Use
- Adding a new create or edit form to any page
- Adding fields to an existing form
- Choosing the right field component for a data type

## Procedure

### 1. Define the Zod Schema

```tsx
import { z } from 'zod'

const formSchema = z.object({
  name:  z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Correo electrónico no válido'),
  // number fields use coerce:
  amount: z.coerce.number({ invalid_type_error: 'Introduce un importe válido' }),
  // date fields — store as Date object, convert on submit
  dueDate: z.date({ invalid_type_error: 'La fecha no es válida' }),
  // enum fields:
  status: z.nativeEnum(SomeEnum, { required_error: 'Selecciona un estado' }),
})
```

Cross-field validation with `.refine()`:
```ts
.refine((data) => data.password === data.passwordRepeat, {
  message: 'Las contraseñas no coinciden',
  path: ['passwordRepeat'],
})
```

### 2. Set Up useForm

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  mode: 'onTouched',       // always onTouched — validate on blur, not on change
  defaultValues: {
    name: '',
    email: '',
    amount: undefined,
    dueDate: undefined,
  },
})
```

**Edit forms**: use `undefined` defaults initially, then call `form.reset(entityData)` inside a `useEffect` when data loads (see [Edit Form Pattern](#edit-form-pattern)).

### 3. Write the Submit Handler

**JSON body (most forms):**
```tsx
function onSubmit(data: z.infer<typeof formSchema>) {
  createEntity(JSON.stringify(data), (res) => {
    navigate(`/entities/${res.data.id}`)
  })
}
```

**FormData (when uploading files):**
```tsx
function onSubmit(data: z.infer<typeof formSchema>) {
  const formData = new FormData()
  formData.append('name', data.name)
  formData.append('amount', data.amount.toString())
  formData.append('dueDate', toDateOnlyString(data.dueDate))  // from @/lib/format-date
  formData.append('file', data.file[0])                       // FileList[0]
  createEntity(formData).then(res => navigate(`/entities/${res.data.id}`))
}
```

Never set `Content-Type` for `FormData` — the browser sets the multipart boundary automatically.

### 4. Render the Form

```tsx
import { Form } from '@/components/ui/form'
import { Field, FieldGroup, FieldLabel, FieldError } from '@/components/ui/field'
import { InputGroup, InputGroupInput, InputGroupAddon } from '@/components/ui/input-group'
import { Controller } from 'react-hook-form'
import { Button } from '@/components/ui/button'

return (
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4'>
      <FieldGroup className='flex flex-col gap-4 sm:grid sm:grid-cols-2'>

        <Controller
          name='name'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  {...field}
                  aria-invalid={fieldState.invalid}
                  id={field.name}
                  type='text'
                  placeholder='Acme SL'
                />
                <InputGroupAddon><UserIcon /></InputGroupAddon>
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

      </FieldGroup>

      {/* Create form button */}
      <Button type='submit' disabled={!form.formState.isDirty}>
        <SaveIcon /> Guardar
      </Button>
    </form>
  </Form>
)
```

**Rules that apply to every field:**
- `data-invalid={fieldState.invalid}` on `<Field>` — triggers red label/border styling
- `aria-invalid={fieldState.invalid}` on the input — triggers red ring via Tailwind
- `FieldError errors={[fieldState.error]}` — always inside `{fieldState.invalid && …}`
- `id={field.name}` links input to label via `FieldLabel htmlFor`

### 5. Edit Form Pattern

```tsx
const [entity, setEntity] = useState<Entity | undefined>()
const [original, setOriginal] = useState<Entity | undefined>()

// Load data
useEffect(() => {
  getEntityById(id).then(res => {
    setEntity(res.data)
    setOriginal(res.data)
  })
}, [id])

// Sync form when data arrives
useEffect(() => {
  if (!entity) return
  form.reset({ name: entity.name, email: entity.email })
}, [entity, form])

// Submit
function onSubmit(data: z.infer<typeof formSchema>) {
  updateEntityById(entity!.id, JSON.stringify(data)).then(res => {
    setEntity(res.data)
    setOriginal(res.data)
    form.reset({ name: res.data.name, email: res.data.email })
  })
}

// Cancel
function handleReset() {
  form.reset()            // resets to last form.reset() call values
  setEntity(original)
}
```

Edit form buttons:
```tsx
const hasChanges = JSON.stringify(original) !== JSON.stringify(entity) || form.formState.isDirty

<Button type='button' variant='secondary' onClick={handleReset} disabled={!hasChanges}>
  <RotateCcwIcon /> Descartar
</Button>
<Button type='submit' disabled={!hasChanges}>
  <SaveIcon /> Guardar
</Button>
```

---

## Field Type Reference

See [./references/field-types.md](./references/field-types.md) for all special field types:
- Select (with `__NONE__` sentinel)
- DatePicker and DateTimePicker
- File upload (FileList pattern)
- Checkbox
- Number input (`coerce` + `valueAsNumber`)
- Textarea
- Programmatic setValue
- useWatch for reactive fields

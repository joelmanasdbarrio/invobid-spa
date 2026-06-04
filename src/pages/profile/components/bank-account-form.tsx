import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Form } from '@/components/ui/form'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { AuthContext } from '@/contexts/auth.context'
import { updateBankAccountById } from '@/services/bank-account.api'
import type { Investor } from '@/types/User'
import { zodResolver } from '@hookform/resolvers/zod'
import { SaveIcon } from 'lucide-react'
import { use } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import z from 'zod'

const bankAccountFormSchema = z.object({
  balance: z.coerce.number<number>().min(0, 'El saldo no puede ser negativo')
})

export default function BankAccountForm ({ user }: { user: Investor }) {
  const authContext = use(AuthContext)
  if (!authContext) {
    throw new Error('AuthContext must be used within AuthProvider')
  }
  const { setLoggedInUser } = authContext

  const bankAccountForm = useForm<z.infer<typeof bankAccountFormSchema>>({
    resolver: zodResolver(bankAccountFormSchema),
    mode: 'onTouched',
    defaultValues: {
      balance: undefined
    }
  })

  const balanceValue = useWatch({ control: bankAccountForm.control, name: 'balance' }) as number | string | null | undefined
  const isBalanceMissing = balanceValue === '' || balanceValue === null || balanceValue === undefined

  function onSubmit (data: z.infer<typeof bankAccountFormSchema>) {
    if (!user || !user.bankAccount) return
    updateBankAccountById(JSON.stringify(data))
      .then((response) => {
        setLoggedInUser((prev) => prev ? {
          ...prev,
          bankAccount: response.data
        } : null)
      })
  }

  return (
    <Form {...bankAccountForm}>
      <form onSubmit={bankAccountForm.handleSubmit(onSubmit)} className='flex flex-col gap-4 **:data-[slot=field-group]:grid lg:**:data-[slot=field-group]:grid-cols-2'>
        <Card>
          <CardContent className='flex flex-col gap-4'>
            <FieldSet>
              <FieldLegend>Actualiza tus datos bancarios</FieldLegend>
              <FieldGroup>
                <Controller
                  name='balance'
                  control={bankAccountForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Añadir saldo a la cartera:</FieldLabel>
                      <InputGroup>
                        <InputGroupInput {...field} id={field.name} type='number' min={0} step={0.01} placeholder='0' />
                        <InputGroupAddon>€</InputGroupAddon>
                      </InputGroup>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </FieldSet>
          </CardContent>
        </Card>
        <Button
          className='w-min self-end justify-self-end'
          disabled={!bankAccountForm.formState.isDirty || isBalanceMissing}
          title='Actualizar datos bancarios'
        >
          <SaveIcon />
          Actualizar datos bancarios
        </Button>
      </form>
    </Form>
  )
}

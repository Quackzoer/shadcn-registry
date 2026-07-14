"use client"
import { FieldResetValueButton } from "@/components/tanstack-form-fields/field-reset-value-button"
import { FormFieldCardSelectOption } from "@/components/tanstack-form-fields/form-field-card-select"
import { useAppForm } from "@/components/tanstack-form-fields/hook"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import * as z from "zod"

const formSchema = z.object({
    firstName: z.string(),
    password: z.string(),
    accountType: z.enum(['personal', 'workRelated', 'other'])
})

type FormSchema = z.infer<typeof formSchema>

const formDefaultValues: Partial<FormSchema> = {
    firstName: '',
    password: 'chuj',
}

export default function TanstackFormFieldsPage() {
    const form = useAppForm({
        validators: {
            onSubmit: formSchema
        },
        defaultValues: formDefaultValues as FormSchema,
        onSubmit: async ({ value }) => {
            console.log(value)
        }
    })
    return (
        <div className="max-w-3xl mx-auto flex flex-col min-h-svh px-4 py-8 gap-8">
            <header className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">
                    Tanstack Form Fields
                </h1>
                <p className="text-muted-foreground">
                    Role and permission-based access control with three fallback modes.
                </p>
            </header>

            <main className="flex flex-col flex-1 gap-10">
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        form.handleSubmit()
                    }}
                >
                    <form.Field
                        name="firstName"
                    >
                        {(field) => {
                            const isInvalid =
                                field.state.meta.isTouched && !field.state.meta.isValid
                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={field.name}>First Name</FieldLabel>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        aria-invalid={isInvalid}
                                        placeholder="Login button not working on mobile"
                                        autoComplete="off"
                                    />
                                    {isInvalid && (
                                        <FieldError errors={field.state.meta.errors} />
                                    )}
                                </Field>
                            )
                        }}
                    </form.Field>
                    <form.AppField
                        name='password'
                    >
                        {(field) => {
                            return (
                                <div className="flex">
                                    <field.Password className='w-full' />
                                    <FieldResetValueButton />
                                </div>
                            )
                        }}
                    </form.AppField>
                    <form.AppField
                        name='accountType'
                    >
                        {(field) => {
                            const options: FormFieldCardSelectOption<FormSchema['accountType']>[] = [
                                {
                                    label: 'Personal',
                                    value: 'personal'
                                },
                                {
                                    value: 'workRelated',
                                    label: "Work Related"
                                },
                                {
                                    value: "other",
                                    label: "Other"
                                }
                            ]
                            return (
                                <div className="flex">
                                    <field.CardSelect options={options} />
                                </div>
                            )
                        }}
                    </form.AppField>
                    <form.AppField
                        name='accountType'
                    >
                        {(field) => {
                            const options: FormFieldCardSelectOption<FormSchema['accountType']>[] = [
                                {
                                    label: 'Personal',
                                    value: 'personal'
                                },
                                {
                                    value: 'workRelated',
                                    label: "Work Related"
                                },
                                {
                                    value: "other",
                                    label: "Other"
                                }
                            ]
                            return (
                                <div className="flex">
                                    <field.CardSelect
                                        options={options}
                                        render={({isSelected, setValue, option, index}) => (
                                            <Button 
                                            variant={isSelected ? 'default' : 'outline'} 
                                            onClick={()=>setValue()}
                                            >
                                                {option.label}{' '}{index+1}
                                            </Button>
                                    )}
                                    />
                                </div>
                            )
                        }}
                    </form.AppField>
                </form>
            </main>
        </div>
    );
}
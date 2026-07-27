"use client"
import { FieldResetValueButton } from "@/registry/tanstack-form/components/fields/field-reset-value-button"
import { FormFieldCardSelectOption } from "@/registry/tanstack-form/components/fields/form-field-card-select"
import { FormFieldLayout } from "@/registry/tanstack-form/components/fields/form-field-layout"
import { useAppForm } from "@/registry/tanstack-form/hooks/use-app-form"
import { FormAutosave } from "@/registry/tanstack-form/components/form-autosave"
import { localStorageAdapter } from "@/registry/tanstack-form/lib/form-autosave-adapter"
import { Button } from "@/components/ui/button"
import * as z from "zod"

const formSchema = z.object({
    firstName: z.string(),
    password: z.string(),
    accountType: z.enum(['personal', 'workRelated', 'other'])
})

type FormSchema = z.infer<typeof formSchema>

const formDefaultValues: Partial<FormSchema> = {
    firstName: '',
    password: '123',
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
                    <FormAutosave
                        adapter={localStorageAdapter}
                        storageKey="tanstack-form-example"
                        debounceMs={300}
                        autoRestore
                    />
                    <form.AppField
                        name="firstName"
                    >
                        {(field) => (
                            <FormFieldLayout label={'First Name'} required description={'Name you were assigned at birth'}>
                                <field.Text/>
                            </FormFieldLayout>
                        )}
                    </form.AppField>
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
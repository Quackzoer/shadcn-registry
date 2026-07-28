import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { FormPasswordField } from "@/registry/tanstack-form/components/fields/form-password-field";
import { FormCardSelectField } from "@/registry/tanstack-form/components/fields/form-field-card-select";
import { FormTextField } from "@/registry/tanstack-form/components/fields/form-text-field";
import { Form } from "../components/form/form";
import { FormSubmitButton } from "../components/form/form-submit";

export const {fieldContext, formContext, useFieldContext, useFormContext} = createFormHookContexts()

export const {useAppForm, withForm, withFieldGroup} = createFormHook({
    fieldContext,
    formContext,
    fieldComponents: {
        Text: FormTextField,
        Password: FormPasswordField,
        CardSelect: FormCardSelectField,
    },
    formComponents: {
        Form: Form,
        Submit: FormSubmitButton
    },
})
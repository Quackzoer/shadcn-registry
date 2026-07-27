import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { FormPasswordField } from "@/registry/tanstack-form/components/fields/form-password-field";
import { FormCardSelectField } from "@/registry/tanstack-form/components/fields/form-field-card-select";
import { FormTextField } from "@/registry/tanstack-form/components/fields/form-text-field";

export const {fieldContext, formContext, useFieldContext} = createFormHookContexts()

export const {useAppForm} = createFormHook({
    fieldContext,
    formContext,
    fieldComponents: {
        Text: FormTextField,
        Password: FormPasswordField,
        CardSelect: FormCardSelectField,
    },
    formComponents: {}
})
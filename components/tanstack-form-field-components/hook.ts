import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { FormPasswordField } from "./form-password-field";
import { FormCardSelectField } from "./form-field-card-select";
import { FormTextField } from "./form-text-field";

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
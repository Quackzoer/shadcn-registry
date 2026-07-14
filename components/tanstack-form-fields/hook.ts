import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { FormPasswordField } from "./password-form-field";
import { FormCardSelectField } from "./form-field-card-select";

export const {fieldContext, formContext, useFieldContext} = createFormHookContexts()

export const {useAppForm} = createFormHook({
    fieldContext,
    formContext,
    fieldComponents: {
        Password: FormPasswordField,
        CardSelect: FormCardSelectField
    },
    formComponents: {}
})
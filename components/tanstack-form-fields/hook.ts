import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { FormPasswordField } from "./password-form-field";

export const {fieldContext, formContext, useFieldContext} = createFormHookContexts()

export const {useAppForm} = createFormHook({
    fieldContext,
    formContext,
    fieldComponents: {
        Password: FormPasswordField
    },
    formComponents: {}
})
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { FormPasswordField } from "../components/fields/form-password-field";
import { FormCardSelectField } from "../components/fields/form-field-card-select";
import { FormTextField } from "../components/fields/form-text-field";
import { FormTextareaField } from "../components/fields/form-textarea-field";
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
        Textarea: FormTextareaField,
    },
    formComponents: {
        Form: Form,
        Submit: FormSubmitButton
    },
})
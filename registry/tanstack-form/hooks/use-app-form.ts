import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { FormPasswordField } from "../components/fields/form-password-field";
import { FormCardSelectField } from "../components/fields/form-field-card-select";
import { FormTextField } from "../components/fields/form-text-field";
import { FormTextareaField } from "../components/fields/form-textarea-field";
import { FieldLabel } from "../components/fields/field-label";
import { FieldError } from "../components/fields/field-error";
import { FieldValidating } from "../components/fields/field-validating";
import { FieldResetValueButton } from "../components/fields/field-reset-value-button";
import { FormFieldInput } from "../components/fields/form-field-input";
import { Form } from "../components/form/form";
import { FormSubmitButton } from "../components/form/form-submit";
import { FormReset } from "../components/form/form-reset";
import { FormAutosave } from "../components/form/form-autosave";

export const {fieldContext, formContext, useFieldContext, useFormContext} = createFormHookContexts()

export const {useAppForm, withForm, withFieldGroup} = createFormHook({
    fieldContext,
    formContext,
    fieldComponents: {
        Text: FormTextField,
        Password: FormPasswordField,
        CardSelect: FormCardSelectField,
        Textarea: FormTextareaField,
        Input: FormFieldInput,
        Label: FieldLabel,
        Error: FieldError,
        Validating: FieldValidating,
        ResetValueButton: FieldResetValueButton,
    },
    formComponents: {
        Form: Form,
        Submit: FormSubmitButton,
        Reset: FormReset,
        Autosave: FormAutosave,
    },
})
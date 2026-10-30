import { useFieldContext } from "../../hooks/use-app-form"
import { HTMLInputTypeAttribute } from "react"
import { FormFieldInput } from "./form-field-input"

interface FormTextFieldProps extends React.ComponentProps<"input"> {
    className?: string
    type?: HTMLInputTypeAttribute,
}

export function FormTextField({ className, type = 'text', ...props }:Readonly<FormTextFieldProps>) {
    const field = useFieldContext<string>()

    return (
        <FormFieldInput
            id={field.name}
            type={type}
            value={field.state.value ?? ""}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            className={className}
            {...props}
        />
    )
}
import { Input } from "@/components/ui/input"
import { useFieldContext } from "@/registry/tanstack-form/hooks/use-app-form"
import { HTMLInputTypeAttribute } from "react"

interface FormTextFieldProps {
    className?: string
    type?: HTMLInputTypeAttribute
}

export function FormTextField({ className, type = 'text' }: Readonly<FormTextFieldProps>) {
    const field = useFieldContext<string>()

    return (
        <Input
            id={field.name}
            type={type}
            value={field.state.value ?? ""}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            className={className}
        />
    )
}
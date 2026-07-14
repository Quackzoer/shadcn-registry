import { Input } from "@/components/ui/input"
import { useFieldContext } from "./hook"

interface FormTextFieldProps {
    className?: string
}

export function FormTextField({ className }: Readonly<FormTextFieldProps>) {
    const field = useFieldContext<string>()

    return (
        <Input
            id={field.name}
            type={"text"}
            value={field.state.value ?? ""}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            className={className}
        />
    )
}
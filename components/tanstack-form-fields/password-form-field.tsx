import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSelector } from "@tanstack/react-form"
import { Eye, EyeOff } from "lucide-react"
import * as React from "react"
import { FormFieldLayout } from "./form-field-layout"
import { useFieldContext } from "./hook"

export interface PasswordFormFieldProps {
    label?: React.ReactNode,
    description?: React.ReactNode,
    required?: boolean
}

export function FormPasswordField({ label, description, required }: Readonly<PasswordFormFieldProps>) {
    const field = useFieldContext<string>()
    const [showPassword, setShowPassword] = React.useState(false)
    const fieldValue = useSelector(field.store, (state) => state.value)
    const fieldErrors = useSelector(field.store, (state) => state.meta.errors)

    return (
        <FormFieldLayout
            id={field.name}
            label={label}
            description={description}
            error={fieldErrors[0]}
            required={required}
        >
            <div className="relative">
                <Input
                    id={field.name}
                    type={showPassword ? "text" : "password"}
                    value={fieldValue ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="pr-10"
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
            </div>
        </FormFieldLayout>
    )
}
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Eye, EyeOff } from "lucide-react"
import * as React from "react"
import { FormTextField } from "./form-text-field"

interface FormPasswordFieldProps {
    className?: string
}

export function FormPasswordField({className}: Readonly<FormPasswordFieldProps>) {
    const [showPassword, setShowPassword] = React.useState(false)

    return (
        <div className={cn("relative",className)}>
            <FormTextField/>
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
    )
}
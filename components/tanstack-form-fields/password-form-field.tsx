import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"
import * as React from "react"
import { useFieldContext } from "./hook"
import { cn } from "@/lib/utils"

interface FormPasswordFieldProps {
    className?: string
}

export function FormPasswordField({className}: Readonly<FormPasswordFieldProps>) {
    const field = useFieldContext<string>()
    const [showPassword, setShowPassword] = React.useState(false)

    return (
        <div className={cn("relative",className)}>
            <Input
                id={field.name}
                type={showPassword ? "text" : "password"}
                value={field.state.value ?? ""}
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
    )
}
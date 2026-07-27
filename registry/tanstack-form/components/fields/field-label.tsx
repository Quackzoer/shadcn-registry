import { useSelector } from "@tanstack/react-form"
import * as React from "react"
import { Label } from "@/components/ui/label"
import { useFieldContext } from "@/registry/tanstack-form/hooks/use-app-form"
import { cn } from "@/lib/utils"

export interface FormLabelProps {
    children: React.ReactNode,
    required?: boolean
}

export function FieldLabel({ children, required }: Readonly<FormLabelProps>) {
    const field = useFieldContext<string>()
    const fieldErrors = useSelector(field.store, (state) => state.meta.errors)

    return (
        <Label htmlFor={field.name} className={cn(
            "text-sm font-medium",
            fieldErrors.length > 0 && 'text-destructive'
        )}>
            {children}
            {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
    )
}
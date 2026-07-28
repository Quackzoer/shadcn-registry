import { useSelector } from "@tanstack/react-form"
import * as React from "react"
import { Label } from "@/components/ui/label"
import { useFieldContext } from "@/registry/tanstack-form/hooks/use-app-form"
import { cn } from "@/lib/utils"

export interface FormLabelProps {
    children: React.ReactNode,
    required?: boolean
    renderRequired?: React.ReactNode | ((required?: boolean)=>React.ReactNode)
}

export function RequiredAstrix(){
    return <span className="text-destructive ml-0.5">*</span>
}

export function RequiredText(){
    return <span className="text-destructive ml-0.5">(required)</span>
}

export function FieldLabel({ children, required, renderRequired: _renderRequired }: Readonly<FormLabelProps>) {
    const field = useFieldContext<string>()
    const fieldErrors = useSelector(field.store, (state) => state.meta.errors)
    const handleFaccRequired = () => typeof _renderRequired === 'function' ? _renderRequired(required) : _renderRequired
    const renderRequired = _renderRequired ? handleFaccRequired() : <RequiredAstrix/>
    return (
        <Label htmlFor={field.name} className={cn(
            "text-sm font-medium",
            fieldErrors.length > 0 && 'text-destructive'
        )}>
            {children}
            {required && renderRequired}
        </Label>
    )
}
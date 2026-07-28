import { useSelector } from "@tanstack/react-form"
import * as React from "react"
import { Label } from "@/components/ui/label"
import { useFieldContext } from "@/registry/tanstack-form/hooks/use-app-form"
import { cn } from "@/lib/utils"
import { useFormMetaContext } from "../../context/form-meta-context"

export interface FormLabelProps {
    children: React.ReactNode,
    required?: boolean
    renderRequired?: React.ReactNode | ((required?: boolean)=>React.ReactNode)
}

export function RequiredAsterisk(){
    return <span className="text-destructive ml-0.5">*</span>
}

export function RequiredText({required}:Readonly<{required?:boolean}>){
    return <span className="text-destructive ml-0.5">{required?(<>(required)</>):(<>(optional)</>)}</span>
}

export function FieldLabel({ children, required, renderRequired: _renderRequired }: Readonly<FormLabelProps>) {
    const formMeta = useFormMetaContext()
    const field = useFieldContext<string>()
    const fieldErrors = useSelector(field.store, (state) => state.meta.errors)
    const renderer = _renderRequired ?? formMeta.renderRequired
    const isFacc = typeof renderer === 'function'
    const renderRequired = isFacc ? renderer(required) : renderer
    return (
        <Label htmlFor={field.name} className={cn(
            "text-sm font-medium",
            fieldErrors.length > 0 && 'text-destructive'
        )}>
            {children}
            {(required || isFacc) && renderRequired}
        </Label>
    )
}
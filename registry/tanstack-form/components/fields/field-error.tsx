import { useFieldContext } from "@/registry/tanstack-form/hooks/use-app-form"

export function FieldError() {
    const field = useFieldContext()
    const fieldMeta = field.getMeta()
    const fieldErrors = fieldMeta.errors
    const fieldIsTouched = fieldMeta.isTouched
    if (fieldErrors.length === 0 || !fieldIsTouched) return null
    return (
        <div className="">
            {fieldErrors.map(err=>(
                <p className="text-[0.8rem] font-medium text-destructive" key={err.message}>{err.message}</p>
            ))}
        </div>
    )
}
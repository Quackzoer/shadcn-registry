import { useSelector } from "@tanstack/react-form"
import { useFieldContext } from "@/registry/tanstack-form/hooks/use-app-form"

export function FieldError() {
    const field = useFieldContext()
    const fieldErrors = useSelector(field.store, (state) => state.meta.errors)
    const fieldIsTouched = useSelector(field.store, (state) => state.meta.isTouched)
    console.log(fieldErrors, fieldIsTouched)
    if (fieldErrors.length === 0 || !fieldIsTouched) return null
    return (
        <div className="">
            {fieldErrors.map(err=>(
                <p className="text-[0.8rem] font-medium text-destructive" key={err}>{err}</p>
            ))}
        </div>
    )
}
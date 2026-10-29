import { useSelector } from "@tanstack/react-form"
import { useFieldContext } from "@/registry/tanstack-form/hooks/use-app-form"

// Schema validators (e.g. Zod) put issue objects with a `message` field in
// `meta.errors`; plain validator functions can return a bare string. Normalize
// both to text so a raw issue object never ends up as a React child.
function getErrorMessage(err: unknown): string {
    if (typeof err === 'string') return err
    if (err && typeof err === 'object' && 'message' in err) return String((err as { message: unknown }).message)
    return String(err)
}

export function FieldError() {
    const field = useFieldContext()
    const fieldErrors = useSelector(field.store, (state) => state.meta.errors)
    const fieldIsTouched = useSelector(field.store, (state) => state.meta.isTouched)
    if (fieldErrors.length === 0 || !fieldIsTouched) return null
    return (
        <div className="">
            {fieldErrors.map((err, i) => {
                const message = getErrorMessage(err)
                return (
                    <p className="text-[0.8rem] font-medium text-destructive" key={`${i}-${message}`}>{message}</p>
                )
            })}
        </div>
    )
}
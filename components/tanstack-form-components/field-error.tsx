import { useFieldContext } from "./hook"

export function FieldError() {
    const field = useFieldContext()
    const fieldErrors = field.getMeta().errors
    if (fieldErrors.length === 0) return null
    return (
        <div className="">
            {fieldErrors.map(err=>(
                <p className="text-[0.8rem] font-medium text-destructive" key={err}>{err}</p>
            ))}
        </div>
    )
}
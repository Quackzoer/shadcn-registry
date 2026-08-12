import { Input } from "@/components/ui/input"
import { useFieldContext } from "@/registry/tanstack-form/hooks/use-app-form"
import { useEffect, useRef } from "react"

export function FormFieldInput(props: Readonly< React.ComponentProps<"input">>) {
    const field = useFieldContext<string>()
    const inputRef = useRef<HTMLInputElement>(null)

    const errors = field.state.meta.errors

    useEffect(() => {
        if (errors.length > 0 && inputRef.current) {
            inputRef.current.focus()
        }
    }, [errors])
    return (
        <Input
            ref={inputRef}
            aria-invalid={errors.length > 0}
            {...props}
        />
    )
}
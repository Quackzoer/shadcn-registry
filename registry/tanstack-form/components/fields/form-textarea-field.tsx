import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group"
import { useFieldContext } from "@/registry/tanstack-form/hooks/use-app-form"
import { useEffect, useRef } from "react"
import { CharacterCounter } from "./character-counter"

interface FormTextareaFieldProps {
    className?: string
    rows?: number
    placeholder?: string
    /** Max characters. Shown in the counter; validation stays with the schema. */
    maxLength?: number
    /** Render the character counter inside the group. */
    showCounter?: boolean
}

export function FormTextareaField({ className, rows = 4, placeholder, maxLength, showCounter = false }: Readonly<FormTextareaFieldProps>) {
    const field = useFieldContext<string>()
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const errors = field.state.meta.errors
    const value = field.state.value ?? ""

    useEffect(() => {
        if (errors.length > 0 && textareaRef.current) {
            textareaRef.current.focus()
        }
    }, [errors])

    return (
        <InputGroup className={className}>
            <InputGroupTextarea
                ref={textareaRef}
                id={field.name}
                rows={rows}
                placeholder={placeholder}
                aria-invalid={errors.length > 0}
                value={value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
            />
            {showCounter && (
                <CharacterCounter
                    length={value.length}
                    max={maxLength}
                    // InputGroupAddon only focuses an <input> on click
                    onClick={() => textareaRef.current?.focus()}
                />
            )}
        </InputGroup>
    )
}

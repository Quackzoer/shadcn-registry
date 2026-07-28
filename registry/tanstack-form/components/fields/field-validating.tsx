import { useSelector } from "@tanstack/react-form"
import { Spinner } from "@/components/ui/spinner"
import { useFieldContext } from "@/registry/tanstack-form/hooks/use-app-form"
import type { ReactNode } from "react"

export interface FieldValidatingProps {
    label?: ReactNode
    /**
     * Overrides the field's built-in `meta.isValidating`. Pass this when the
     * field's async validator is driven by `useAsyncFieldValidator` (see hook
     * docs for why the built-in flag isn't reliable across repeated validations).
     */
    isValidating?: boolean
}

export function FieldValidating({ label = "Checking…", isValidating: isValidatingOverride }: Readonly<FieldValidatingProps>) {
    const field = useFieldContext()
    const metaIsValidating = useSelector(field.store, (state) => state.meta.isValidating)
    const isValidating = isValidatingOverride ?? metaIsValidating

    if (!isValidating) return null

    return (
        <div className="flex items-center gap-1.5 text-[0.8rem] text-muted-foreground">
            <Spinner className="size-3" />
            {label}
        </div>
    )
}

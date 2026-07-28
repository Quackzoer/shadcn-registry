import { useSelector } from "@tanstack/react-form"
import { Spinner } from "@/components/ui/spinner"
import { useFieldContext } from "@/registry/tanstack-form/hooks/use-app-form"
import type { ReactNode } from "react"

export function FieldValidating({ label = "Checking…" }: Readonly<{ label?: ReactNode }>) {
    const field = useFieldContext()
    const isValidating = useSelector(field.store, (state) => state.meta.isValidating)

    if (!isValidating) return null

    return (
        <div className="flex items-center gap-1.5 text-[0.8rem] text-muted-foreground">
            <Spinner className="size-3" />
            {label}
        </div>
    )
}

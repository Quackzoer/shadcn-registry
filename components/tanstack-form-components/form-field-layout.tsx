// components/ui/form-field-layout.tsx
import * as React from "react"
import { FieldLabel } from "./field-label"
import { FieldDescription } from "./field-description"
import { FieldError } from "./field-error"

interface FormFieldLayoutProps {
    label?: React.ReactNode
    description?: React.ReactNode
    required?: boolean
    children: React.ReactNode
}

export function FormFieldLayout({
    label,
    description,
    required,
    children,
}: Readonly<FormFieldLayoutProps>) {
    return (
        <div className="space-y-1.5 w-full">
            {label && (
                <FieldLabel required={required}>
                    {label}
                </FieldLabel>
            )}

            {children}

            {description && (
                <FieldDescription>
                    {description}
                </FieldDescription>
            )}

            <FieldError/>
        </div>
    )
}
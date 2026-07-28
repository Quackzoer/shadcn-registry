// components/ui/form-field-layout.tsx
import * as React from "react"
import { FieldLabel } from "./field-label"
import { FieldDescription } from "./field-description"
import { FieldError } from "./field-error"
import { FieldValidating } from "./field-validating"
import { FieldResetValueButton } from "./field-reset-value-button"

interface FormFieldLayoutProps {
    label?: React.ReactNode
    description?: React.ReactNode
    required?: boolean
    children: React.ReactNode
    showResetFieldButton?: boolean
}

export function FormFieldLayout({
    label,
    description,
    required,
    children,
    showResetFieldButton
}: Readonly<FormFieldLayoutProps>) {
    return (
        <div className="space-y-1.5 w-full">
            {label && (
                <FieldLabel required={required}>
                    {label}
                </FieldLabel>
            )}
            <div className="flex w-full">
                {children}
                {showResetFieldButton && <FieldResetValueButton/>}
            </div>

            <FieldValidating />

            {description && (
                <FieldDescription>
                    {description}
                </FieldDescription>
            )}

            <FieldError />
        </div>
    )
}
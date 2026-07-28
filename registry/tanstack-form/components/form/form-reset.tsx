'use client'

import { Button, buttonVariants } from "@/components/ui/button"
import { useFormContext } from "../../hooks/use-app-form"
import { VariantProps } from "class-variance-authority"

type FormResetProps = Omit<React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean
    }, 'onClick'>

export function FormReset({ children = 'Reset', ...props }: FormResetProps) {
    const form = useFormContext()
    const resetForm = () => {
        form.reset()
    }
    return (
        <Button onClick={resetForm} {...props} >
            {children}
        </Button>
    )
}
'use client'

import { Button } from "@/components/ui/button"
import { useFormContext } from "../../hooks/use-app-form"
import { LoadingSwap } from "@/registry/loading-swap/components/loading-swap"
import { ReactNode } from "react"

export interface FormSubmitButtonProps{
    label?: ReactNode
} 

export function FormSubmitButton({label}:Readonly<FormSubmitButtonProps>){
    const form = useFormContext()
    return (
        <form.Subscribe selector={(state)=>state.isSubmitting}>
            {(isSubmitting)=>(
                <Button>
                    <LoadingSwap isLoading={isSubmitting}>
                        {label}
                    </LoadingSwap>
                </Button>
            )}
        </form.Subscribe>
    )
}
import * as React from "react"
import { Card, CardContent, CardHeader } from "../ui/card"
import { useFieldContext } from "./hook"
import { cn } from "@/lib/utils"

export interface FormFieldCardSelectOption<V = string> {
    value: V
    label: string
    icon?: React.ReactNode
}

interface RenderProps<O extends FormFieldCardSelectOption<any> = FormFieldCardSelectOption<string>> {
    option: O
    isSelected: boolean
    index: number
    setValue: () => void
}

interface FormCardSelectFieldProps<O extends FormFieldCardSelectOption<any> = FormFieldCardSelectOption<string>> {
    render?: (props: RenderProps<O>) => React.ReactNode
    options: Array<O>
    className?: string
}

export function FormCardSelectField<O extends FormFieldCardSelectOption<any>>({ render, options, className }: Readonly<FormCardSelectFieldProps<O>>) {
    const field = useFieldContext()

    return (
        <div className={cn('flex gap-2 w-full', className)}>
            {options.map((option, index) => {
                const isSelected = option.value === field.state.value
                const setValue = () => {
                    field.setValue(option.value)
                }
                if (render) return render({
                    option,
                    isSelected,
                    index,
                    setValue
                })
                return (
                    <Card key={option.value} onClick={() => setValue()} className={
                        cn("basis-0 grow",
                            isSelected && 'bg-primary text-primary-foreground'
                        )
                    }>
                        <CardHeader>
                            {option.icon}
                        </CardHeader>
                        <CardContent>
                            {option.label}
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
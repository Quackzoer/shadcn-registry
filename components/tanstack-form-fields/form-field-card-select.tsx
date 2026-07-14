import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"
import * as React from "react"
import { useFieldContext } from "./hook"
import { Card, CardContent, CardHeader } from "../ui/card"

interface Option {
    value: string
    label: string
    icon?: React.ReactNode
}

interface RenderProps {
    value: string
    isSelected: boolean
    index: number
    setValue: () => void
}

interface FormCardSelectFieldProps {
    render?: (props: RenderProps) => React.ReactNode
    options: Array<Option>
}

export function FormCardSelectField({ render, options }: Readonly<FormCardSelectFieldProps>) {
    const field = useFieldContext<string>()

    return (
        <div className="relative">
            {options.map(({ value, icon, label }, index) => {
                const isSelected = value === field.state.value
                const setValue = () => {
                    field.setValue(value)
                }
                if (render) return render({
                    value,
                    isSelected,
                    index, 
                    setValue
                })
                return (
                    <Card key={value} onClick={() => setValue()}>
                        <CardHeader>
                            {icon}
                        </CardHeader>
                        <CardContent>
                            {label}
                        </CardContent>
                    </Card>
                )
            })}

        </div>
    )
}
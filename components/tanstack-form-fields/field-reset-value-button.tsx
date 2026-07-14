import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"
import { useFieldContext } from "./hook"

export function FieldResetValueButton() {
    const field = useFieldContext()
    const formDefaultValue = field.form.options.defaultValues[field.name]
    const fieldDefaultValue = field.options.defaultValue
    const resetValue = () => {
        field.setValue(fieldDefaultValue ?? formDefaultValue)
    }
    return (
        <Button
            type="button"
            variant="outline"
            size="icon"
            className=""
            onClick={() => resetValue()}
        >
            <RotateCcw />
        </Button>
    )
}
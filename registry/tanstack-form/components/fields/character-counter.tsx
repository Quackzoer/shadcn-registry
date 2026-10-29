import { InputGroupAddon, InputGroupText } from "@/components/ui/input-group"
import { cn } from "@/lib/utils"

interface CharacterCounterProps extends Omit<React.ComponentProps<typeof InputGroupAddon>, "children"> {
    length: number
    max?: number
}

/**
 * Character count rendered as an InputGroup addon, so it sits inside the
 * group's border. Turns destructive once `length` exceeds `max`.
 */
export function CharacterCounter({ length, max, align = "block-end", className, ...props }: Readonly<CharacterCounterProps>) {
    const isOver = max !== undefined && length > max

    return (
        <InputGroupAddon align={align} className={cn("justify-end", className)} {...props}>
            <InputGroupText className={cn("tabular-nums text-xs", isOver && "text-destructive")}>
                {max === undefined ? length : `${length} / ${max}`}
            </InputGroupText>
        </InputGroupAddon>
    )
}

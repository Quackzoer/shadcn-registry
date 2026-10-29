import { useCallback, useRef, useState } from "react"

/**
 * TanStack Form's built-in `onChangeAsyncDebounceMs` leaks the previous debounce
 * timer id (`field.timeoutIds.validations[cause]` is never reset after it fires),
 * so after the first validation cycle `field.state.meta.isValidating` flips true
 * then false again within the same tick on every subsequent run — no visible
 * spinner. This hook debounces and tracks the pending state itself instead, so
 * consumers get a reliable `isValidating` flag independent of that internal state.
 */
export function useAsyncFieldValidator<TValue, TError = string>(
    validate: (value: TValue) => Promise<TError | undefined>,
    debounceMs = 500
) {
    const [isValidating, setIsValidating] = useState(false)
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)
    const callIdRef = useRef(0)

    const debouncedValidate = useCallback(
        (value: TValue): Promise<TError | undefined> => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            const callId = ++callIdRef.current
            setIsValidating(true)

            return new Promise((resolve) => {
                timeoutRef.current = setTimeout(async () => {
                    try {
                        const result = await validate(value)
                        resolve(callId === callIdRef.current ? result : undefined)
                    } finally {
                        if (callId === callIdRef.current) setIsValidating(false)
                    }
                }, debounceMs)
            })
        },
        [validate, debounceMs]
    )

    return { validate: debouncedValidate, isValidating }
}

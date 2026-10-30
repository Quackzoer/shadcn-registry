import { useEffect, useRef } from "react"
import { useFieldContext } from "../../hooks/use-app-form"
import type { CaptureResult } from "../../lib/capture/capture-parser"
import { CaptureInput, type CaptureInputProps } from "./capture-input"

export interface FormCaptureFieldProps<K extends string = "tag">
  extends Omit<CaptureInputProps<K>, "value" | "onValueChange" | "id" | "name" | "inputRef"> {
  /**
   * Fires with the parsed result on every change. The field itself stores the
   * raw text (tokens included); run `extractCapture(value, parser)` on submit,
   * or use this to mirror tokens into other fields.
   */
  onCapture?: (result: CaptureResult<K>) => void
}

/**
 * Form field around {@link CaptureInput}. The field value is the text as typed,
 * so the user can edit a token like any other text.
 */
export function FormCaptureField<K extends string = "tag">({
  onCapture,
  onBlur,
  ...props
}: Readonly<FormCaptureFieldProps<K>>) {
  const field = useFieldContext<string>()
  const inputRef = useRef<HTMLInputElement>(null)
  const errors = field.state.meta.errors

  useEffect(() => {
    if (errors.length > 0) inputRef.current?.focus()
  }, [errors])

  return (
    <CaptureInput<K>
      {...props}
      id={field.name}
      name={field.name}
      inputRef={inputRef}
      aria-invalid={errors.length > 0}
      value={field.state.value ?? ""}
      onValueChange={(raw, result) => {
        field.handleChange(raw)
        onCapture?.(result)
      }}
      onBlur={(event) => {
        field.handleBlur()
        onBlur?.(event)
      }}
    />
  )
}

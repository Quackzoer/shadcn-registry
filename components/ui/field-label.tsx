"use client"

import * as React from "react"
import { FormProvider, type UseFormReturn } from "react-hook-form"
import * as z from "zod"

import { cn } from "@/lib/utils"
import { useFormField } from "@/registry/ui/form"
import { Label } from "@/registry/ui/label"

// ——— Schema context ———

const ZodSchemaContext = React.createContext<z.ZodObject<z.ZodRawShape> | null>(null)

export function useZodSchema() {
  return React.useContext(ZodSchemaContext)
}

// ——— SchemaFormProvider ———

interface SchemaFormProviderProps {
  form: UseFormReturn<any>
  schema: z.ZodObject<z.ZodRawShape>
  children: React.ReactNode
}

export function SchemaFormProvider({ form, schema, children }: Readonly<SchemaFormProviderProps>) {
  return (
    <ZodSchemaContext.Provider value={schema}>
      <FormProvider {...form}>{children}</FormProvider>
    </ZodSchemaContext.Provider>
  )
}

// ——— Schema traversal ———

// Uses any internally: Zod v4 shape values are typed as $ZodType (internal base class),
// not ZodTypeAny (public), so we work untyped and cast at the boundary.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrapZodType(type: any): any {
  // ZodOptional / ZodNullable → .unwrap()
  if (typeof type?.unwrap === "function") {
    return unwrapZodType(type.unwrap())
  }
  // ZodDefault → .removeDefault()
  if (typeof type?.removeDefault === "function") {
    return unwrapZodType(type.removeDefault())
  }
  // ZodEffects (.refine, .transform) → .innerType()
  if (typeof type?.innerType === "function") {
    return unwrapZodType(type.innerType())
  }
  return type
}

function resolveSchemaForPath(
  schema: z.ZodObject<z.ZodRawShape>,
  path: string
): z.ZodTypeAny | null {
  try {
    const parts = path.split(".")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = schema
    for (const part of parts) {
      const unwrapped = unwrapZodType(current)
      if (!unwrapped?.shape || typeof unwrapped.shape !== "object") return null
      current = unwrapped.shape[part]
      if (!current) return null
    }
    return current as z.ZodTypeAny
  } catch {
    return null
  }
}

// ——— FieldLabel ———

interface FieldLabelProps extends React.ComponentProps<typeof Label> {
  /** Override the field name for required detection. Defaults to the name from FormField context. */
  name?: string
}

export function FieldLabel({ name: nameProp, className, children, ...props }: Readonly<FieldLabelProps>) {
  const { name: contextName, formItemId, error } = useFormField()
  const schema = useZodSchema()
  const name = nameProp ?? contextName

  const fieldSchema = schema ? resolveSchemaForPath(schema, name) : null
  const required = fieldSchema ? !fieldSchema.isOptional() : false

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    >
      {children}
      {required && (
        <span aria-hidden="true" className="text-destructive ml-0.5">
          *
        </span>
      )}
    </Label>
  )
}

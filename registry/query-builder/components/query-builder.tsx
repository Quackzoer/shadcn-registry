"use client"

import * as React from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  type QueryBuilderProps,
  type QueryCondition,
  type QueryFieldSchema,
  type QueryOperator,
  OPERATOR_LABELS,
} from "@/registry/query-builder/types/query-builder"
import {
  getFieldSchema,
  getOperatorsForField,
  needsValue,
} from "@/registry/query-builder/lib/parse-query"

// ---------------------------------------------------------------------------
// Draft helpers
// ---------------------------------------------------------------------------

type DraftStage = "field" | "operator" | "value"

function getStage(draft: string): DraftStage {
  const commas = (draft.match(/,/g) ?? []).length
  if (commas < 1) return "field"
  if (commas < 2) return "operator"
  return "value"
}

function getFieldPart(draft: string): string {
  return (draft.split(",")[0] ?? "").trim()
}

function getOperatorPart(draft: string): string {
  return (draft.split(",")[1] ?? "").trim()
}

function getValuePart(draft: string): string {
  return draft.split(",").slice(2).join(",").trim()
}

function computeCurrent(
  draft: string,
  schema: readonly QueryFieldSchema[],
): QueryCondition | null {
  const commas = (draft.match(/,/g) ?? []).length
  if (commas < 1) return null
  const fp = getFieldPart(draft)
  const op = getOperatorPart(draft)
  const vp = getValuePart(draft)
  if (
    getFieldSchema(schema, fp) &&
    getOperatorsForField(schema, fp).includes(op as QueryOperator)
  ) {
    const cond: QueryCondition = { field: fp, operator: op as QueryOperator }
    if (vp) cond.value = vp
    return cond
  }
  return null
}

// ---------------------------------------------------------------------------
// Query chip
// ---------------------------------------------------------------------------

function ConditionChip({
  condition,
  schema,
  onRemove,
  dashed,
}: {
  condition: QueryCondition
  schema: readonly QueryFieldSchema[]
  onRemove: () => void
  dashed?: boolean
}) {
  const fs = getFieldSchema(schema, condition.field)
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-0 rounded-md text-sm transition-colors select-none",
        dashed
          ? "border border-dashed border-muted-foreground/30 opacity-60"
          : "border border-transparent",
      )}
    >
      <span className="flex items-center rounded-l-md bg-blue-500/15 px-2 py-0.5 text-blue-700 dark:text-blue-400">
        {fs?.label ?? condition.field}
      </span>
      <span className="flex items-center bg-purple-500/15 px-1.5 py-0.5 text-purple-700 dark:text-purple-400">
        {OPERATOR_LABELS[condition.operator]}
      </span>
      {condition.value !== undefined && (
        <span className="flex items-center rounded-r-md bg-green-500/15 px-2 py-0.5 text-green-700 dark:text-green-400">
          {condition.value}
        </span>
      )}
      {condition.value === undefined && (
        <span className="flex items-center rounded-r-md bg-green-500/15 px-2 py-0.5">
          <span className="sr-only">empty</span>
        </span>
      )}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        className="ml-0.5 flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <X className="size-3" />
      </button>
    </span>
  )
}

// ---------------------------------------------------------------------------
// Suggestion dropdown
// ---------------------------------------------------------------------------

interface SuggestionDropdownProps {
  options: string[];
  highlightIndex: number;
  onSelect: (value: string) => void;
  renderOption?: (value: string) => React.ReactNode;
}

function SuggestionDropdown({
  options,
  highlightIndex,
  onSelect,
  renderOption,
}: SuggestionDropdownProps) {
  const listRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const el = listRef.current?.children[highlightIndex] as HTMLElement | undefined
    el?.scrollIntoView({ block: "nearest" })
  }, [highlightIndex])

  if (options.length === 0) return null

  return (
    <div
      role="listbox"
      ref={listRef}
      className="bg-popover text-popover-foreground absolute top-full z-50 mt-1 max-h-60 w-full overflow-hidden rounded-md border shadow-md"
    >
      <ScrollArea className="max-h-60">
        {options.map((opt, i) => (
          <div
            key={opt}
            role="option"
            aria-selected={i === highlightIndex}
            className={cn(
              "flex cursor-pointer items-center px-3 py-1.5 text-sm outline-none",
              i === highlightIndex && "bg-accent text-accent-foreground",
            )}
            onMouseDown={(e) => {
              e.preventDefault()
              onSelect(opt)
            }}
          >
            {renderOption?.(opt) ?? opt}
          </div>
        ))}
      </ScrollArea>
    </div>
  )
}

// ---------------------------------------------------------------------------
// QueryInput — the core chip + autocomplete input
// ---------------------------------------------------------------------------

function QueryInput({
  schema,
  conditions,
  onConditionsChange,
  placeholder = "Add filter...",
  className,
}: Pick<
  QueryBuilderProps,
  "schema" | "conditions" | "onConditionsChange" | "placeholder" | "className"
> & {
  conditions: QueryCondition[];
  onConditionsChange: (c: QueryCondition[]) => void;
}) {
  const [draft, setDraft] = React.useState("")
  const [focused, setFocused] = React.useState(false)
  const [highlightIndex, setHighlightIndex] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const conditionsRef = React.useRef(conditions)
  conditionsRef.current = conditions

  const stage = getStage(draft)
  const fieldPart = getFieldPart(draft)
  const operatorPart = getOperatorPart(draft)
  const valuePart = getValuePart(draft)
  const fieldSchema = getFieldSchema(schema, fieldPart)

  // Live condition computed from draft — no state, no effect
  const current = computeCurrent(draft, schema)

  const rawOptions = React.useMemo(() => {
    if (stage === "field") return schema.map((f) => f.name)
    if (stage === "operator") return fieldSchema ? getOperatorsForField(schema, fieldPart) : []
    if (stage === "value" && fieldSchema?.options) return [...fieldSchema.options]
    return []
  }, [stage, schema, fieldSchema, fieldPart])

  const typed = stage === "field" ? fieldPart : stage === "operator" ? operatorPart : valuePart

  const options = React.useMemo(() => {
    if (!typed) return rawOptions
    const lower = typed.toLowerCase()
    return rawOptions.filter((o) => o.toLowerCase().includes(lower))
  }, [rawOptions, typed])

  const showDropdown = focused && options.length > 0

  React.useEffect(() => {
    setHighlightIndex(0)
  }, [draft])

  function commit(condition: QueryCondition) {
    onConditionsChange([...conditionsRef.current, condition])
    setDraft("")
    setHighlightIndex(0)
  }

  function removeCondition(index: number) {
    onConditionsChange(conditionsRef.current.filter((_, i) => i !== index))
  }

  function handleSelect(value: string) {
    if (stage === "field") {
      const fs = getFieldSchema(schema, value)
      if (fs && fs.operators?.length === 1 && fs.operators[0] && !needsValue(fs.operators[0])) {
        commit({ field: value, operator: fs.operators[0] })
        return
      }
      setDraft(value + ",")
    } else if (stage === "operator") {
      const op = value as QueryOperator
      if (!needsValue(op)) {
        commit({ field: fieldPart, operator: op })
        return
      }
      setDraft(fieldPart + "," + value + ",")
    } else {
      commit({ field: fieldPart, operator: operatorPart as QueryOperator, value })
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = current
      ? fieldPart + "," + operatorPart + "," + e.target.value
      : e.target.value
    setDraft(raw)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightIndex((h) => Math.min(h + 1, options.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightIndex((h) => Math.max(h - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (options[highlightIndex]) {
        handleSelect(options[highlightIndex])
      } else if (draft.trim()) {
        if (stage === "operator" && fieldSchema) {
          const validOps = getOperatorsForField(schema, fieldPart)
          if (validOps.includes(operatorPart as QueryOperator)) {
            if (!needsValue(operatorPart as QueryOperator)) {
              commit({ field: fieldPart, operator: operatorPart as QueryOperator })
            } else {
              setDraft(fieldPart + "," + operatorPart + ",")
            }
          }
        } else if (stage === "value" && fieldSchema) {
          commit({
            field: fieldPart,
            operator: operatorPart as QueryOperator,
            value: valuePart || undefined,
          })
        }
      }
    } else if (e.key === "Escape") {
      setFocused(false)
    } else if (e.key === "Backspace") {
      const inputEmpty = (current ? valuePart : draft) === ""
      if (inputEmpty && current) {
        setDraft(fieldPart + "," + operatorPart)
      } else if (inputEmpty && !current && conditionsRef.current.length > 0) {
        removeCondition(conditionsRef.current.length - 1)
      }
    }
  }

  function renderFieldOption(name: string) {
    const fs = getFieldSchema(schema, name)
    if (!fs) return name
    return (
      <span className="flex items-center gap-2">
        <span className="font-medium">{fs.label}</span>
        <span className="text-muted-foreground text-xs">{fs.type}</span>
      </span>
    )
  }

  function renderOperatorOption(op: string) {
    return (
      <span className="flex items-center gap-2">
        <code className="text-xs">{op}</code>
        <span className="text-muted-foreground text-xs">
          {OPERATOR_LABELS[op as QueryOperator]}
        </span>
      </span>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2.5 py-1.5 shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        className,
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {conditions.map((c, i) => (
        <ConditionChip
          key={`${c.field}-${c.operator}-${c.value}-${i}`}
          condition={c}
          schema={schema}
          onRemove={() => removeCondition(i)}
        />
      ))}

      {current && (
        <ConditionChip
          condition={current}
          schema={schema}
          onRemove={() => setDraft("")}
          dashed
        />
      )}

      <div className="relative min-w-[160px] flex-1">
        <input
          ref={inputRef}
          type="text"
          value={current ? valuePart : draft}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={conditions.length === 0 ? placeholder : "Add filter..."}
          className="w-full bg-transparent py-0.5 text-sm outline-none placeholder:text-muted-foreground"
        />

        {showDropdown && (
          <SuggestionDropdown
            options={options}
            highlightIndex={highlightIndex}
            onSelect={handleSelect}
            renderOption={
              stage === "field"
                ? renderFieldOption
                : stage === "operator"
                  ? renderOperatorOption
                  : undefined
            }
          />
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// QueryBuilder — wrapper that manages conditions
// ---------------------------------------------------------------------------

function QueryBuilder({
  schema,
  conditions: controlledConditions,
  onConditionsChange,
  multi = true,
  placeholder = "Add filter...",
  className,
}: QueryBuilderProps) {
  const [internalConditions, setInternalConditions] = React.useState<
    QueryCondition[]
  >([])

  const conditions = controlledConditions ?? internalConditions
  const setConditions = onConditionsChange ?? setInternalConditions

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <QueryInput
        schema={schema}
        conditions={conditions}
        onConditionsChange={setConditions}
        placeholder={placeholder}
      />
    </div>
  )
}

export { QueryBuilder }

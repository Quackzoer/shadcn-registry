"use client"

import * as React from "react"
import { Combobox as ComboboxPrimitive } from "@base-ui/react"
import { PlusIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
} from "@/registry/combobox/components/combobox"
import {
  defaultCaptureParser,
  extractCapture,
  findActiveToken,
  formatToken,
  segmentCapture,
  type CaptureParser,
  type CaptureResult,
  type CaptureToken,
} from "../../lib/capture/capture-parser"

/* -------------------------------------------------------------------------- */
/* Sources                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Where suggestions for one token kind come from. The input knows nothing
 * about tags, projects or priorities: it only asks the source for items.
 */
export interface CaptureSource<Item = any> {
  items: readonly Item[]
  getLabel: (item: Item) => string
  /** Stable key for list rendering. Defaults to the label. */
  getKey?: (item: Item) => React.Key
  /** Defaults to a case-insensitive "label contains query". */
  filter?: (item: Item, query: string) => boolean
  /** Row content. Defaults to the label. */
  renderItem?: (item: Item) => React.ReactNode
  /** Text written for a picked item, without the trailing space. Defaults to trigger + label, quoted if it has spaces. */
  serialize?: (item: Item, token: CaptureToken) => string
  /** Fired when a suggestion is picked. */
  onSelect?: (item: Item, token: CaptureToken) => void
  /**
   * Offers a "Create …" row when the typed value matches no item. The typed
   * text is kept either way; return `false` (synchronously) to leave it
   * untouched, e.g. when you navigate away instead.
   */
  onCreate?: (value: string, token: CaptureToken) => void | boolean | Promise<unknown>
  getCreateLabel?: (value: string) => string
  /** Cap on suggestion rows. Default 8. */
  maxItems?: number
}

/** Identity helper that infers `Item` for a source. */
export function captureSource<Item>(source: CaptureSource<Item>): CaptureSource<Item> {
  return source
}

type Entry =
  | { type: "item"; item: unknown; label: string; key: React.Key }
  | { type: "create"; value: string; label: string }

function buildEntries(token: CaptureToken | undefined, source: CaptureSource | undefined): Entry[] {
  if (!token || !source) return []
  const query = token.value.trim()
  const needle = query.toLowerCase()

  const matches = source.items.filter((item) =>
    source.filter ? source.filter(item, query) : source.getLabel(item).toLowerCase().includes(needle),
  )
  const startsWith = (item: unknown) => source.getLabel(item).toLowerCase().startsWith(needle)
  const ordered = [...matches.filter(startsWith), ...matches.filter((item) => !startsWith(item))]

  const entries: Entry[] = ordered.slice(0, source.maxItems ?? 8).map((item) => {
    const label = source.getLabel(item)
    return { type: "item", item, label, key: source.getKey?.(item) ?? label }
  })

  const exact = source.items.some((item) => source.getLabel(item).toLowerCase() === needle)
  if (source.onCreate && query && !exact) {
    entries.push({
      type: "create",
      value: query,
      label: source.getCreateLabel?.(query) ?? `Create "${query}"`,
    })
  }
  return entries
}

/* -------------------------------------------------------------------------- */
/* Mirror                                                                     */
/* -------------------------------------------------------------------------- */

// An <input> cannot contain markup, so the highlighted copy of the text is a
// sibling laid over it. It has to match the input's text metrics exactly, and
// those differ per design system, so they are read from the input at runtime
// rather than hard-coded.
const MIRROR_STYLE_PROPS = [
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "font-variant",
  "font-kerning",
  "font-feature-settings",
  "letter-spacing",
  "word-spacing",
  "text-transform",
  "text-indent",
  "line-height",
  "tab-size",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "border-top-width",
  "border-right-width",
  "border-bottom-width",
  "border-left-width",
  "box-sizing",
] as const

const DEFAULT_TOKEN_CLASS = "rounded-[3px] bg-primary/10 text-primary"

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value)
  else if (ref) (ref as React.MutableRefObject<T | null>).current = value
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export interface CaptureInputProps<K extends string = "tag">
  extends Omit<
    React.ComponentProps<"input">,
    "value" | "defaultValue" | "onChange" | "type" | "size" | "ref" | "children"
  > {
  /** The text as typed, tokens included. */
  value: string
  /**
   * Called as the user types or picks a suggestion. `result.value` is the text
   * without tokens, `result.tokens` what was captured.
   */
  onValueChange: (raw: string, result: CaptureResult<K>) => void
  /**
   * Finds tokens in the text. Keep its identity stable (module scope or
   * `useMemo`). Defaults to `#tags`; combine more with `composeParsers`.
   */
  parser?: CaptureParser<K>
  /** Suggestion sources, by token kind. A kind without a source is highlighted but has no popup. */
  sources?: Partial<Record<K, CaptureSource>>
  /** Highlight classes for every token. Only colours and backgrounds: anything that changes glyph width (padding, bold) misaligns the text. */
  tokenClassName?: string
  tokenClassNames?: Partial<Record<K, string>>
  /** Class for the wrapper element. `className` still goes to the input. */
  containerClassName?: string
  inputRef?: React.Ref<HTMLInputElement>
}

export function CaptureInput<K extends string = "tag">({
  value,
  onValueChange,
  parser = defaultCaptureParser as unknown as CaptureParser<K>,
  sources,
  tokenClassName = DEFAULT_TOKEN_CLASS,
  tokenClassNames,
  containerClassName,
  className,
  inputRef: forwardedInputRef,
  disabled,
  onFocus,
  onBlur,
  onKeyDown,
  onKeyUp,
  onClick,
  onSelect,
  onScroll,
  ...inputProps
}: Readonly<CaptureInputProps<K>>) {
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const mirrorRef = React.useRef<HTMLDivElement | null>(null)
  const pendingCaret = React.useRef<number | null>(null)
  const highlighted = React.useRef<Entry | undefined>(undefined)

  const [caret, setCaret] = React.useState(value.length)
  const [focused, setFocused] = React.useState(false)
  const [dismissedKey, setDismissedKey] = React.useState<string | null>(null)

  const setInputRef = React.useCallback(
    (element: HTMLInputElement | null) => {
      inputRef.current = element
      assignRef(forwardedInputRef, element)
    },
    [forwardedInputRef],
  )

  /* ---- derive everything from the one parse ---- */
  const tokens = React.useMemo(() => parser(value), [parser, value])
  const segments = React.useMemo(() => segmentCapture(value, tokens), [value, tokens])
  const active = findActiveToken(tokens, caret)
  const source = active ? sources?.[active.kind] : undefined
  const entries = buildEntries(active, source)
  const activeKey = active ? `${active.kind}:${active.start}:${active.raw}` : null
  const open = focused && !disabled && entries.length > 0 && activeKey !== dismissedKey

  /* ---- keep the mirror glued to the input ---- */
  const syncScroll = React.useCallback(() => {
    const input = inputRef.current
    const mirror = mirrorRef.current
    if (input && mirror) mirror.scrollLeft = input.scrollLeft
  }, [])

  const syncMetrics = React.useCallback(() => {
    const input = inputRef.current
    const mirror = mirrorRef.current
    if (!input || !mirror) return
    const computed = getComputedStyle(input)
    for (const prop of MIRROR_STYLE_PROPS) {
      mirror.style.setProperty(prop, computed.getPropertyValue(prop))
    }
    mirror.scrollLeft = input.scrollLeft
  }, [])

  React.useLayoutEffect(() => {
    syncMetrics()
    const input = inputRef.current
    if (!input) return
    const observer = new ResizeObserver(syncMetrics)
    observer.observe(input)
    document.fonts?.ready.then(syncMetrics)
    return () => observer.disconnect()
  }, [syncMetrics])

  React.useLayoutEffect(() => {
    syncScroll()
    // Put the caret after a just-inserted suggestion, once the new value is in the DOM.
    const input = inputRef.current
    const target = pendingCaret.current
    if (input && target !== null) {
      pendingCaret.current = null
      const position = Math.min(target, input.value.length)
      input.setSelectionRange(position, position)
      setCaret(position)
    }
  })

  React.useEffect(() => {
    highlighted.current = undefined
  }, [activeKey, entries.length])

  /* ---- committing text ---- */
  const commit = (next: string) => {
    onValueChange(next, extractCapture(next, parser))
  }

  const readCaret = (input: HTMLInputElement) => {
    setCaret(input.selectionStart ?? input.value.length)
    syncScroll()
  }

  const apply = (entry: Entry) => {
    if (!active || !source) return

    let inserted: string
    if (entry.type === "create") {
      if (source.onCreate?.(entry.value, active) === false) return
      inserted = formatToken(active.trigger, entry.value)
    } else {
      source.onSelect?.(entry.item, active)
      inserted = source.serialize
        ? source.serialize(entry.item, active)
        : formatToken(active.trigger, source.getLabel(entry.item))
    }

    const followedBySpace = /\s/.test(value[active.end] ?? "")
    const next =
      value.slice(0, active.start) + inserted + (followedBySpace ? "" : " ") + value.slice(active.end)
    // Land after the space, whether it was just added or was already there.
    pendingCaret.current = active.start + inserted.length + 1
    commit(next)
  }

  /* ---- render ---- */
  return (
    <div data-slot="capture-input" className={cn("relative w-full", containerClassName)}>
      <Combobox<Entry>
        items={entries}
        filter={null}
        value={null}
        inputValue={value}
        open={open}
        disabled={disabled}
        itemToStringLabel={(entry) => entry.label}
        onValueChange={(entry) => {
          if (entry) apply(entry)
        }}
        onInputValueChange={(next, details) => {
          // Picking a suggestion also reports an input change; `apply` owns that text.
          if (details.reason !== "input-change") return
          commit(next)
          const input = inputRef.current
          if (input) setCaret(input.selectionStart ?? next.length)
          requestAnimationFrame(syncScroll)
        }}
        onOpenChange={(nextOpen) => {
          setDismissedKey(nextOpen ? null : activeKey)
        }}
        onItemHighlighted={(entry) => {
          highlighted.current = entry
        }}
      >
        <ComboboxPrimitive.Input
          ref={setInputRef}
          autoComplete="off"
          spellCheck={false}
          render={
            <Input
              className={cn(
                // The mirror draws the text; the input keeps the caret, selection and IME.
                "text-transparent caret-foreground selection:bg-primary/25 selection:text-transparent",
                className,
              )}
            />
          }
          onFocus={(event) => {
            setFocused(true)
            // Coming back to the field offers the suggestions again after an Escape or a blur.
            setDismissedKey(null)
            readCaret(event.currentTarget)
            onFocus?.(event)
          }}
          onBlur={(event) => {
            setFocused(false)
            onBlur?.(event)
          }}
          onSelect={(event) => {
            readCaret(event.currentTarget)
            onSelect?.(event)
          }}
          onKeyUp={(event) => {
            readCaret(event.currentTarget)
            onKeyUp?.(event)
          }}
          onClick={(event) => {
            readCaret(event.currentTarget)
            onClick?.(event)
          }}
          onScroll={(event) => {
            syncScroll()
            onScroll?.(event)
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event)
            if (event.defaultPrevented || !open) return
            // Tab accepts the highlighted suggestion, or the first real one. It never triggers "Create".
            if (event.key === "Tab" && !event.shiftKey) {
              const target = highlighted.current ?? entries.find((entry) => entry.type === "item")
              if (target) {
                event.preventDefault()
                apply(target)
              }
            }
          }}
          {...inputProps}
        />

        <div
          ref={mirrorRef}
          aria-hidden
          data-slot="capture-input-mirror"
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center overflow-hidden border border-solid border-transparent text-foreground",
            disabled && "opacity-50",
          )}
        >
          <span className="shrink-0 whitespace-pre">
            {segments.map((segment) =>
              segment.type === "text" ? (
                <React.Fragment key={`t${segment.start}`}>{segment.text}</React.Fragment>
              ) : (
                <span
                  key={`k${segment.start}`}
                  data-slot="capture-token"
                  data-kind={segment.token.kind}
                  data-complete={segment.token.complete}
                  className={cn(tokenClassName, tokenClassNames?.[segment.token.kind])}
                >
                  {segment.text}
                </span>
              ),
            )}
          </span>
        </div>

        <ComboboxContent>
          <ComboboxList>
            {(entry: Entry) =>
              entry.type === "create" ? (
                <ComboboxItem key="__create__" value={entry}>
                  <PlusIcon />
                  {entry.label}
                </ComboboxItem>
              ) : (
                <ComboboxItem key={entry.key} value={entry}>
                  {source?.renderItem ? source.renderItem(entry.item) : entry.label}
                </ComboboxItem>
              )
            }
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}

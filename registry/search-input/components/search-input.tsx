'use client'

import { formatForDisplay, type RegisterableHotkey } from '@tanstack/hotkeys'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useDebouncer } from '@tanstack/react-pacer'
import { SearchIcon, XIcon } from 'lucide-react'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from 'react'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Kbd } from '@/components/ui/kbd'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

/** A filter may be synchronous (local array) or asynchronous (server-side). */
export type SearchFilter<TItem> = (
  items: TItem[],
  query: string
) => TItem[] | Promise<TItem[]>

export interface SearchState<TItem> {
  /** Exactly what is in the input, updating on every keystroke. */
  rawQuery: string
  /** The trimmed query the current results correspond to. Lags `rawQuery` by the debounce. */
  query: string
  results: TItem[]
  count: number
  /** Debounce timer is running — the user is still typing. */
  isPending: boolean
  /** An async filter is in flight. */
  isSearching: boolean
  /** True once `minLength` is met. */
  hasQuery: boolean
  clear: () => void
}

export interface SearchInputProps<TItem> {
  items: TItem[]
  /**
   * How to match. Receives the whole array so it can sort by relevance, score
   * fuzzily, or ignore `items` entirely and hit a server.
   */
  filter: SearchFilter<TItem>

  /** Render the results. Omit to use `onResults` instead. */
  children?: (state: SearchState<TItem>) => ReactNode
  onResults?: (results: TItem[], query: string) => void

  // Controlled / uncontrolled
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void

  debounceMs?: number
  /** Don't search until the query is at least this long. Below it, everything shows. */
  minLength?: number

  placeholder?: string
  disabled?: boolean
  autoFocus?: boolean
  className?: string
  'aria-label'?: string

  showCount?: boolean
  formatCount?: (count: number, query: string) => ReactNode
  showClear?: boolean
  showPending?: boolean
  /**
   * Key that focuses the input with ⌘/Ctrl. `false` disables the shortcut.
   * @default 'k'
   */
  shortcut?: RegisterableHotkey
}

/**
 * A debounced search input that filters a list and reports how many matched.
 *
 * The component owns the query, the debounce, and the result bookkeeping; the
 * matching itself is entirely yours via `filter`. That single seam is what
 * makes it work equally for a local `Array.filter`, a fuzzy-scored sort, or a
 * server round-trip — it never assumes your items have a `name`.
 *
 * ```tsx
 * <SearchInput
 *   items={users}
 *   filter={(items, q) =>
 *     items.filter((u) => u.email.toLowerCase().includes(q.toLowerCase()))
 *   }
 * >
 *   {({ results }) => results.map((u) => <Row key={u.id} user={u} />)}
 * </SearchInput>
 * ```
 */
export function SearchInput<TItem>({
  items,
  filter,
  children,
  onResults,
  value,
  defaultValue = '',
  onValueChange,
  debounceMs = 300,
  minLength = 0,
  placeholder = 'Search...',
  disabled = false,
  autoFocus = false,
  className,
  'aria-label': ariaLabel = 'Search',
  showCount = true,
  formatCount,
  showClear = true,
  showPending = true,
  shortcut = 'Control+K',
}: SearchInputProps<TItem>) {
  const isControlled = value !== undefined
  const [internalQuery, setInternalQuery] = useState(defaultValue)
  const rawQuery = isControlled ? value : internalQuery

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TItem[]>(items)
  const [isSearching, setIsSearching] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  // Held in refs so the debounced function never goes stale, without having to
  // recreate the debouncer (and drop its pending timer) on every render.
  const filterRef = useRef(filter)
  filterRef.current = filter
  const itemsRef = useRef(items)
  itemsRef.current = items
  const onResultsRef = useRef(onResults)
  onResultsRef.current = onResults

  // Guards against a slow async filter resolving after a newer one and
  // overwriting fresher results.
  const requestIdRef = useRef(0)

  const runSearch = useCallback(
    async (nextQuery: string) => {
      const requestId = ++requestIdRef.current
      const trimmed = nextQuery.trim()

      if (trimmed.length < minLength) {
        setQuery('')
        setResults(itemsRef.current)
        setIsSearching(false)
        onResultsRef.current?.(itemsRef.current, '')
        return
      }

      const outcome = filterRef.current(itemsRef.current, trimmed)

      if (outcome instanceof Promise) {
        setIsSearching(true)
        try {
          const resolved = await outcome
          if (requestId !== requestIdRef.current) return
          setResults(resolved)
          setQuery(trimmed)
          onResultsRef.current?.(resolved, trimmed)
        } finally {
          if (requestId === requestIdRef.current) setIsSearching(false)
        }
        return
      }

      setResults(outcome)
      setQuery(trimmed)
      onResultsRef.current?.(outcome, trimmed)
    },
    [minLength]
  )

  // The selector is a hook-level subscription: `isPending` has to be correct in
  // the `state` handed to `children`, and that can only come from a subscription
  // this component actually re-renders on. `debouncer.Subscribe` would scope the
  // re-render more tightly, but it can only feed JSX in its own subtree — it
  // can't populate a value the render-prop contract promises.
  //
  // The cost is two extra renders per search burst (pending on, pending off).
  const debouncer = useDebouncer(runSearch, { wait: debounceMs }, (s) => ({
    isPending: s.isPending,
  }))
  const isPending = debouncer.state.isPending

  const commit = useCallback(
    (next: string) => {
      if (!isControlled) setInternalQuery(next)
      onValueChange?.(next)
      debouncer.maybeExecute(next)
    },
    [debouncer, isControlled, onValueChange]
  )

  const clear = useCallback(() => {
    if (!isControlled) setInternalQuery('')
    onValueChange?.('')
    // Cancel rather than debounce: clearing should feel instant, and letting a
    // queued search land afterwards would repopulate a list the user just emptied.
    debouncer.cancel()
    void runSearch('')
    inputRef.current?.focus()
  }, [debouncer, isControlled, onValueChange, runSearch])

  // Re-filter when the source data changes underneath a live query — otherwise
  // results would show a stale snapshot after a refetch.
  const hasQuery = query.length > 0
  useEffect(() => {
    if (!hasQuery) {
      setResults(items)
      return
    }
    void runSearch(query)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  // `Mod` resolves to Cmd on macOS and Ctrl elsewhere, so one binding covers
  // both platforms. `enabled` unregisters the hotkey entirely when the caller
  // opts out, rather than registering a listener that early-returns.
  // Cast because `shortcut` is an open `string` while RegisterableHotkey is a
  // closed union of known key names — the value is validated at runtime instead.
  useHotkey(shortcut, () => inputRef.current?.focus(), {
    enabled: shortcut && !disabled,
    preventDefault: true,
  })

  // Scoped to the input via `target`, so these only fire while it has focus and
  // don't hijack Escape or Enter for the rest of the page. `ignoreInputs: false`
  // is required because hotkeys are suppressed inside form fields by default —
  // which is exactly where these two need to work.
  useHotkey('Escape', () => clear(), {
    target: inputRef,
    enabled: !disabled && rawQuery.length > 0,
    ignoreInputs: false,
    preventDefault: true,
  })

  // Enter skips the remaining debounce rather than making the user wait it out.
  useHotkey('Enter', () => debouncer.flush(), {
    target: inputRef,
    enabled: !disabled,
    ignoreInputs: false,
    preventDefault: true,
  })


  const handleChange = (event: ChangeEvent<HTMLInputElement>) =>
    commit(event.target.value)

  const count = results.length
  const renderCount = useCallback(
    (pending: boolean) => {
      if (!showCount || !hasQuery) return null
      if (pending) return null
      return (
        <span className="text-muted-foreground text-xs tabular-nums">
          {formatCount
            ? formatCount(count, query)
            : `${count} ${count === 1 ? 'result' : 'results'}`}
        </span>
      )
    },
    [count, formatCount, hasQuery, query, showCount]
  )

  const state: SearchState<TItem> = useMemo(
    () => ({
      rawQuery,
      query,
      results,
      count,
      isPending,
      isSearching,
      hasQuery,
      clear,
    }),
    [rawQuery, query, results, count, isPending, isSearching, hasQuery, clear]
  )

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <InputGroup>
        <InputGroupInput
          ref={inputRef}
          value={rawQuery}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-label={ariaLabel}
          type="search"
        />

        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>

        <InputGroupAddon align="inline-end" className="gap-2">
          {showPending && (isPending || isSearching) ? (
            <Spinner className="size-4" />
          ) : null}
          {renderCount(isPending || isSearching)}

          {showClear && rawQuery ? (
            <InputGroupButton
              variant="ghost"
              size="icon-sm"
              onClick={clear}
              aria-label="Clear search"
              disabled={disabled}
            >
              <XIcon />
            </InputGroupButton>
          ) : shortcut ? (
            <Kbd>
              {formatForDisplay(shortcut)}
            </Kbd>
          ) : null}
        </InputGroupAddon>
      </InputGroup>

      {children?.(state)}
    </div>
  )
}

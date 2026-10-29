# search-input

Debounced search over any list. You supply the matching function; the component
owns the query, the debounce, the result count, and the loading states.

```bash
npx shadcn@latest add https://shadcn.krzysztof.kazor.com/r/search-input.json
```

Demo: [`/search-input`](../../app/search-input)

## The one seam

```tsx
<SearchInput
  items={users}
  filter={(items, q) => items.filter((u) => u.email.includes(q))}
>
  {({ results }) => results.map((u) => <Row key={u.id} user={u} />)}
</SearchInput>
```

`filter` receives the **whole array**, not one item at a time. That's deliberate
— it means the same component handles relevance sorting, fuzzy scoring,
grouping, or ignoring `items` entirely and calling a server. A per-item
predicate would have quietly ruled all of that out.

It may return `TItem[]` or `Promise<TItem[]>`; async is detected at runtime, so
there's no separate "async mode" to opt into.

Nothing is assumed about your items — no `name` field, no `id`, no shape at all.

## Render prop

`children` receives:

| | |
| --- | --- |
| `results` / `count` | the matches |
| `query` | trimmed query the results correspond to |
| `rawQuery` | what's in the box right now |
| `isPending` | debounce timer running — user still typing |
| `isSearching` | async filter in flight |
| `hasQuery` | `minLength` satisfied |
| `clear()` | empty it and refocus |

`isPending` and `isSearching` are separate on purpose: one means "we haven't
started yet", the other "we're waiting on the network". Conflating them makes a
spinner flicker on every keystroke.

Prefer `onResults` if you'd rather render outside the component.

## Props

| Prop | Default | |
| --- | --- | --- |
| `items` | — | source array |
| `filter` | — | your matcher |
| `debounceMs` | `300` | |
| `minLength` | `0` | below this, everything shows and no count appears |
| `value` / `defaultValue` / `onValueChange` | — | controlled or uncontrolled |
| `placeholder` `disabled` `autoFocus` `className` `aria-label` | | |
| `showCount` | `true` | |
| `formatCount` | `"N results"` | `(count, query) => ReactNode` |
| `showClear` | `true` | |
| `showPending` | `true` | spinner during debounce/search |
| `shortcut` | `'k'` | ⌘/Ctrl focus key; `false` to disable |

Keyboard: **⌘K** focus · **Escape** clear · **Enter** skip the remaining debounce.

## Three things it gets right that are easy to get wrong

**Stale async responses are discarded.** Every search takes a sequence number
and a resolved promise is dropped if a newer one started meanwhile. Without
this, typing "ada" can leave you looking at results for "ad" whenever the
shorter query's request happens to return last — the classic search race.

**Clearing is immediate, not debounced.** Clearing cancels the pending
debounce rather than queuing another pass. Otherwise a queued search lands
afterwards and repopulates the list the user just emptied.

**Changing `items` re-filters.** If the source data refetches while a query is
active, results recompute rather than showing a stale snapshot.

## A note on `useDebouncer` state

Built on [`@tanstack/react-pacer`](https://tanstack.com/pacer). Pacer holds no
reactive subscription by default — you opt in, either with a hook-level
`selector` or the `debouncer.Subscribe` HOC.

This component uses the **hook-level selector**:

```ts
const debouncer = useDebouncer(runSearch, { wait }, (s) => ({ isPending: s.isPending }))
```

`Subscribe` scopes re-renders more tightly, and would be the better choice for
an indicator sitting on its own. It can't be used here because it only feeds
JSX inside its own subtree, and `isPending` has to be a real value in the state
object handed to `children`. The cost is two extra renders per search burst —
pending on, pending off.

Also worth knowing: `ReactDebouncer` is typed as `Omit<Debouncer, 'store'>`, so
`debouncer.store` does **not** exist on the React wrapper even though the
underlying class has it. Reach for `debouncer.state` with a selector instead.

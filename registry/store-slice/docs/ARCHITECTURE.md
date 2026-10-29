# Architecture — decisions and the reasoning behind them

Each section is a decision that could reasonably have gone another way, with
the reason it went this way. Read `PATTERNS.md` first if you only want recipes.

---

## 1. Query shapes are derived from TanStack, never re-declared

`QuerySnapshot<TData, TError>` is a `Pick` from the library's own
`UseQueryResult`:

```ts
export type QuerySnapshot<TData, TError = Error> = Pick<
  UseQueryResult<TData, TError>,
  'data' | 'error' | 'isPending' | 'isLoading' | 'isFetching' | 'isError' | 'isSuccess'
>;
```

Three consequences worth naming:

**The store's vocabulary cannot drift from the library's.** When TanStack
changed `isLoading` semantics in v5 (`isPending` became "no data yet",
`isLoading` became "pending *and* fetching"), a hand-written
`{ isLoading: boolean; error: Error | null }` would have kept compiling while
silently meaning something different. A `Pick` would have surfaced it.

**A real query result is assignable as-is.** Because `Pick` produces a
structural type, `syncQuery(useGetCrmById(id))` type-checks without adapters,
mapping, or a wrapper object — you hand it the hook's return value directly.

**Adding a mirrored field is a one-line change.** `MirroredQueryField` is the
single source of truth; the state keys, the setter names, and the runtime
`pickQuerySnapshot` loop all derive from it. Add `'isRefetching'` to the union
and the `as const satisfies` array beside it, and every entity in the app grows
`crm_isRefetching` and `setIsRefetching`.

The trade-off accepted here is a real dependency on `@tanstack/react-query`
types in the store layer. That is a type-only import that disappears at
runtime, and the store's entire reason for existing is to mirror queries, so
pretending the coupling isn't there buys nothing.

---

## 2. State keys are optional, not initialized

`EntityState` is wrapped in `Partial`:

```ts
export type EntityState<TName extends string, TData, TError = Error> =
  Partial<PrefixedKeys<QuerySnapshot<TData, TError>, `${TName}_`>>;
```

The slice factory therefore returns no initial-state block at all — just
`crmSetters`, plus `crmGetters` / `crmActions` when configured.

This removes the "mention every property and set it to null" step, and it also
fixes a modelling bug that was present before. `crm_isLoading: false` as an
initial value asserts "this query is not loading", which is false — the query
has not been observed yet. `undefined` says exactly that, and it is
distinguishable from `false`. Components that want the old behaviour write
`crm_isLoading ?? false`, and `lib/create-entity-access.ts`'s `useIsLoading()` does that for you.

The cost is that consumers see `boolean | undefined` instead of `boolean`.
That is honest rather than convenient, and it pushes the "not yet loaded" case
into the type system where a reviewer can see it was considered.

---

## 3. Setters, getters, actions are three namespaces, not one

The previous design put everything in `{name}Actions`. Splitting it three ways
gives each namespace a single, statable job:

- **Setters** — generated. One `set{Field}` per mirrored field, plus
  `syncQuery`, `patchData`, `reset`. Never contains logic you wrote.
- **Getters** — yours. Derived reads. Receive `get`, so they can read across
  slices. Should not write.
- **Actions** — yours. Custom logic. Receive `set` and `get`.

The practical payoff is that "did someone put business logic in here?" becomes
answerable by location rather than by reading the body. It also means a
generated setter can be overridden without that override disappearing into a
pile of hand-written functions.

### Why setter names lost their entity prefix

`crmActions.setCrmData` → `crmSetters.setData`. The prefix was already carried
by the namespace key, so repeating it added length without information. More
importantly, `setData` is now the *same name across every entity*, which makes
generic code (`useSyncQuery`, `lib/create-entity-access.ts`) possible and makes the shape
learnable once rather than per entity.

The one thing lost is grep-by-full-name: `grep setCrmData` used to find every
call site. `grep 'crmSetters.setData'` does the same job.

---

## 4. Setter overrides receive the defaults

```ts
setters?: (set, get, defaults: EntitySetters<TData, TError>) =>
  Partial<EntitySetters<TData, TError>>;
```

Returning a `Partial` means you override only what you name. Receiving
`defaults` means an override can decorate:

```ts
setData: (data) => { defaults.setData(data); somethingElse(); }
```

Without `defaults`, every override would have to reimplement the key-writing it
is trying to extend, which reintroduces exactly the boilerplate the toolkit
removes — and does it in the highest-risk place, where behaviour is custom.

---

## 5. The store stays flat

`crm_data`, not `crm: { data }`. Reasons, in order of how often they bite:

- `set({ crm_data })` is a shallow merge. Nested state needs
  `set(s => ({ crm: { ...s.crm, data } }))` at every write.
- Selectors stay reference-stable naturally. `s => s.crm_data` returns the same
  reference across unrelated updates; `s => s.crm` returns a new object every
  time the parent is respread.
- `partialize` in `persist` can cherry-pick a single field
  (`{ crm_selectedId: state.crm_selectedId }`) without reconstructing a nested
  shape.

The cost is collision risk on one global namespace, which the mandatory prefix
handles, and it is what the current codebase already does — so this is
continuity, not a new bet.

---

## 6. Entity and list are separate, composable slices

Requirement 1.2 and 1.4. `createEntitySlice` and `createListSlice` are
independent; an entity that never needs a collection simply does not compose
one, and its `crm_list` key does not exist to be misread as "empty".

They share a name prefix but not key names — `crm_data`/`crm_isLoading` versus
`crm_list`/`crm_isListLoading` — so both can sit on the flat store for the same
entity without collision. This is why `ListQuerySnapshot` renames rather than
reuses: `isListLoading` exists so that a list's loading state and the main
entity's loading state are two independently observable facts.

`crm_selectedId` + `crmListGetters.getSelected()` is the answer to "operate on a
different entity than the one in `crm_data`": selection is a pointer into the
list, resolved on read, so it cannot go stale against the list contents the way
a second copy of the entity would.

---

## 7. The circularity rule

This is the one sharp edge, and it is inherent to zustand rather than to this
design.

A slice whose getters read the whole store needs `AppStore` to type `get`. If
`AppStore` is in turn defined as `ReturnType<typeof createCrmSlice>`, the two
definitions reference each other and TypeScript reports
`TS7022 / TS2577 / TS2456`.

**The rule:** declare the getters/actions *signatures*, derive everything else.

```ts
// 1. Only your content is hand-written
interface CrmGetters {
  systemLabel: () => string | undefined;
}

// 2. State and setters are derived around it
export type AppStore =
  DefineEntitySlice<'crm', CrmMeta, { getters: CrmGetters }> &
  ListSlice<'crm', CrmMeta, number> &
  DefineEntitySlice<'survey', SurveyMeta>;

// 3. Implement, passing AppStore explicitly
const createCrmSlice = createEntitySlice<CrmMeta>()<'crm', AppStore, CrmGetters>(
  'crm',
  { getters: (get) => ({ systemLabel: () => get().crm_data?.crm_system.toUpperCase() }) }
);
```

Slices with no cross-slice getters have no cycle and can be fully inferred via
`ReturnType<typeof createSurveySlice>` if you prefer.

Note what is *not* hand-written even in the circular case: no state keys, no
initial values, no setters. You write the signatures of the functions you were
going to write anyway.

---

## 8. `FnsOf<T>` instead of `Record<string, AnyFn>`

A constraint of `Record<string, AnyFn>` rejects `interface CrmGetters`, because
interfaces have no implicit index signature — while the identical `type` alias
is accepted. That inconsistency would be a genuinely baffling error message for
whoever hit it first.

```ts
export type FnsOf<T> = { [K in keyof T]: AnyFn };
// used as: <TGetters extends FnsOf<TGetters>>
```

A self-referential mapped constraint accepts interfaces and type aliases alike
while still rejecting non-function members. This was found by the typecheck,
not by reasoning — see the `TS2344` failure it fixed.

---

## 9. `useSyncQuery` depends on fields, not the result object

TanStack returns a new result object on every render, so
`useEffect(..., [query])` would fire every render. The individual mirrored
fields are referentially stable, so the effect depends on those:

```ts
useEffect(() => { sync(query); },
  [sync, query.data, query.error, query.isPending, query.isLoading,
   query.isFetching, query.isError, query.isSuccess]);
```

`sync` is stable because the setters object is created once when the slice is
created and never respread.

`useSyncQueryWithCleanup` adds `useEffect(() => reset, [reset])` so a layout
leaves no stale entity behind on unmount. It is opt-in because "keep the last
entity visible during navigation" is sometimes the desired behaviour.

---

## 10. What was deliberately not built

Each of these was considered and turned down for a stated reason, so the
absence is a decision rather than an oversight:

- **Normalized entity tables** (`byId` / `allIds`). Correct for large, shared,
  cross-referenced collections; overkill for per-route collections of tens of
  items, and it would force every read through a selector.
- **Automatic query-key → slice binding.** Would remove the `useSyncQuery` line
  entirely, but requires a `QueryCache` subscription and makes the data flow
  invisible. The explicit one-liner is worth keeping.
- **Writing through the store to the server.** Mutations belong in TanStack;
  the store mirrors, it does not own.

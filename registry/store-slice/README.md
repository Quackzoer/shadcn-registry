# store-slice

Composable zustand slices that mirror TanStack Query. Generates the state
keys, the setters, and a one-call `syncQuery` from just a name and a data
type — so an entity slice is one line instead of a hundred.

```bash
npx shadcn@latest add https://shadcn.krzysztof.kazor.com/r/store-slice.json
```

Live example: [`/store-slice`](../../app/store-slice) · Design notes:
[`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) · Recipes:
[`docs/PATTERNS.md`](./docs/PATTERNS.md)

## Layout

```
registry/store-slice/
├── types/
│   ├── query-state.ts       Pick<UseQueryResult, …> — the mirrored shapes
│   └── slice.ts             computed slice types: state, setters, getters
├── lib/
│   ├── query-snapshot.ts    field lists + snapshot copying
│   ├── create-entity-slice.ts
│   ├── create-list-slice.ts
│   └── create-entity-access.ts
├── hooks/
│   └── use-sync-query.ts    the React glue
└── index.ts
```

Installs as one cohesive folder under `@lib/store-slice/…`, so the relative
imports between these files keep working regardless of a consuming project's
path aliases.

## The problem

A typical hand-written entity slice costs ~100 lines, of which almost none is
your content:

```ts
export const createCrmSlice: StateCreator<AppStore, [], [], CrmSlice> = (set) => ({
  crm_data: null, crm_list: [], crm_error: null,
  crm_listError: null, crm_isListLoading: false, crm_isLoading: false,
  crmActions: {
    setCrmData:      (crm_data)      => set({ crm_data }),
    setCrmList:      (crm_list)      => set({ crm_list }),
    setCrmIsLoading: (crm_isLoading) => set({ crm_isLoading }),
    setCrmError:     (crm_error)     => set({ crm_error }),
    // …two more, identical except for which key they write
  },
});
```

Then, in every layout component, one `useEffect` per entity that mirrors
`data` only — so `crm_isLoading` and `crm_error` are declared in the store and
written by nothing.

## The same entity here

```ts
const createCrmSlice = createEntitySlice<CrmMeta>()<'crm', AppStore>('crm');
```

| Key | Type |
| --- | --- |
| `crm_data` | `CrmMeta \| undefined` |
| `crm_error` | `Error \| null \| undefined` |
| `crm_isPending` `crm_isLoading` `crm_isFetching` `crm_isError` `crm_isSuccess` | `boolean \| undefined` |
| `crmSetters` | `setData` `setError` `setIsPending` `setIsLoading` `setIsFetching` `setIsError` `setIsSuccess` `syncQuery` `patchData` `reset` |

Add `createListSlice<CrmMeta, number>()('crm')` for the collection: `crm_list`,
six list status keys, `crm_selectedId`, `crmListSetters` (`setList`,
`syncListQuery`, `setSelectedId`, `updateById`, `upsertById`, `removeById`,
`resetList`) and `crmListGetters` (`getById`, `getSelected`).

## Component side

```ts
// before — mirrors data only
const { setCrmData } = useAppStore(s => s.crmActions);
const { data } = useGetCrmById(id);
useEffect(() => { setCrmData(data ?? null); }, [data, setCrmData]);

// after — every mirrored field
useSyncQuery(useGetCrmById(id), useAppStore(s => s.crmSetters.syncQuery));
```

## Three namespaces

| Namespace | Who writes it | Purpose |
| --- | --- | --- |
| `{name}_*` | generated | flat, prefixed, optional query state |
| `{name}Setters` | generated, **individually overridable** | field writes + `syncQuery` / `patchData` / `reset` |
| `{name}Getters` | you | derived reads; `get()` sees the whole store |
| `{name}Actions` | you | custom logic; gets `set` and `get` |

Overrides decorate rather than replace, because the generated defaults are
handed to you:

```ts
setters: (set, get, defaults) => ({
  setData: (data) => {
    defaults.setData(data);
    if (data) get().crmListSetters.upsertById(data);
  },
}),
```

## Two things that will surprise you

**Uninitialized fields read `undefined`, not `false` / `null` / `[]`.** This is
deliberate — `crm_isLoading: false` would assert "not loading", which is untrue
before the query has ever been observed. It does mean `crm_list.map(...)` needs
`(crm_list ?? []).map(...)`.

**`AppStore` must be declared before the slice creators, not inferred from
them.** A slice whose getters read the whole store needs `AppStore` to type
`get`; inferring `AppStore` back from that slice is circular and TypeScript
reports TS7022 / TS2456. Declare your getter/action signatures, and let
`DefineEntitySlice` derive the state and setters around them —
see [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) § 7 and
[`app/store-slice/types.ts`](../../app/store-slice/types.ts) for the shape.

## Verification

The implementation this was ported from is covered by 13 runtime tests
(generated setter names, `syncQuery` mirroring of success/loading/error phases,
`patchData` merge and no-op, setter overrides, list by-id operations,
selection resolution, and cross-slice getters/actions). This repository has no
test runner, so those tests were not ported — if you add one, they are worth
bringing across before changing any of the factory logic.

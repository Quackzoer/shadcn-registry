# entity-sidebar

State and filter/sort primitives for a searchable, filterable, sortable list of
entities — the navigation sidebar pattern, but equally a picker or command
palette.

```bash
npx shadcn@latest add https://shadcn.krzysztof.kazor.com/r/entity-sidebar.json
```

## What this ships — and what it doesn't

**Ships:** the zustand slice, the entity/filter/sort types, and a set of generic
filter and sort functions.

**Does not ship: the sidebar chrome.** That was a deliberate cut. In the app
this came from, the shell was bound to a user avatar, a sign-out mutation, and
env-specific constants — and sidebar chrome is exactly where apps differ most.
What is genuinely reusable is the state model underneath, so that is what you
get. Bring your own markup; the slice tells you what to render.

## The state model

```
sidebar_raw_entities        what you put in, never mutated
sidebar_search_query        free-text query
sidebar_filter_options[]    filter controls, as data
sidebar_sort_options[]      sort controls, as data
sidebar_selected_entity_id
sidebar_is_entities_loading / sidebar_entities_error
sidebar_entities_label / sidebar_add_button
```

`sidebarActions.getEntities()` derives the visible list: search, then every
active filter, then every active sort. Raw input is never overwritten, so
clearing a filter is free.

## Filters and sorts are data, not booleans

Each option carries both the control that renders it and the function that
applies it:

```ts
setFilterOptions([
  {
    key: 'archived',
    component: <ArchivedToggle />,
    fn: undefined,          // inactive
  },
])

// toggling it on:
updateFilterOption('archived', { fn: filterSidebarByArchived(), value: true })
```

An inactive option keeps `fn: undefined` rather than being removed from the
array — that way the control stays rendered in the same position instead of
disappearing when you turn it off.

Both filters and sorts recurse into `subEntities`, so a nested tree is filtered
at every level rather than only at the top.

## Included functions

| Function | Behaviour |
| --- | --- |
| `filterSidebarByMeta(predicate)` | the general case — everything else is this with a predicate |
| `filterSidebarByArchived()` | keep only `meta.archived === true` |
| `filterSidebarByActive()` | keep everything not archived |
| `filterSidebarByConditionMet()` | keep unless `meta.condition_met === false` |
| `sortSidebarByName(dir)` | `'a-z' \| 'z-a'`, via `localeCompare` |
| `sortSidebarByCreatedAt(dir)` | `'asc' \| 'desc'` |

Entities marked `disableSort` are pinned — lifted out before sorting and put
back at the top, so "create new…" rows keep their place.

`filterSidebarByConditionMet` is `!== false`, not `=== true`: an entity with no
condition at all is kept, and only an explicit `false` is filtered out.

## Composing it

Store-agnostic, so it spreads into any zustand store:

```ts
import { createSidebarSlice, type SidebarSlice } from '@/lib/entity-sidebar-slice'

type AppStore = SidebarSlice & /* your other slices */

const useAppStore = create<AppStore>()((set, get) => ({
  ...createSidebarSlice<AppStore>()(set, get),
}))
```

## Typed access per entity

The store holds entities as `SidebarEntity<unknown>` so one slice serves every
entity type in the app. `TypedSidebarSlice<TMeta>` casts on the way out to give
a per-screen typed handle:

```ts
const useProjectSidebar = <R,>(sel: (s: TypedSidebarSlice<Project>) => R) =>
  useAppStore(sel as (s: AppStore) => R)

const projects = useProjectSidebar((s) => s.sidebarActions.getEntities())
// Array<SidebarEntity<Project>>
```

This is the same trade-off as any cast-on-read: the narrowing is asserted, not
proven, so a screen that puts the wrong entity type in gets no warning. Pairs
naturally with the [`store-slice`](../store-slice) item, which uses the same
approach for query-backed entity state.

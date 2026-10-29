# data-table

A virtualized TanStack Table wrapper with per-instance state, row grouping,
column pinning, and a composable filters popover.

```bash
npx shadcn@latest add https://shadcn.krzysztof.kazor.com/r/data-table.json
```

## Layout

```
registry/data-table/components/
├── data-table-context.tsx      per-instance zustand store + hooks
├── data-table-provider.tsx     builds the table instance, provides context
├── data-table.tsx              virtualized rendering, pinning, row groups
├── data-table-column-header.tsx  sortable header with a visibility menu
├── data-table-search.tsx       global filter input
└── table-filters-popover.tsx   filters shell + two generic builders
```

## State model

Each table instance gets its **own** zustand store, created in the provider and
handed down through `DataTableStoreContext` — so two tables on one page never
share sorting or selection. Read from it with `useDataTableStore(selector)`.

The TanStack `Table` instance travels separately through
`DataTableInstanceContext`, wrapped in an object. That wrapper is deliberate:
the instance is stable and mutated in place, so passing it bare would let React
skip notifying consumers when its internal state changes.

```tsx
const sorting = useDataTableStore((s) => s.sorting)   // reactive store state
const table = useDataTable<Row>()                     // the TanStack instance
```

## Filters

`TableFiltersPopover` is only a shell — a trigger with an active-count badge
and a list of separated panels. Each entry is a `TableFilterOption` whose
`component` is rendered as-is, so filters can be anything.

Two generic builders ship with it:

```tsx
<TableFiltersPopover
  filters={[
    buildCheckboxFilter({ table, columnId: 'archived', label: 'Archived only' }),
    buildMultiSelectFilter({
      table,
      columnId: 'owner',
      label: 'Owner',
      options: owners,          // { id, name }[]
      emptyMessage: 'No owners',
    }),
  ]}
/>
```

Anything domain-specific is expected to live in your app as its own
`build*Filter` returning a `TableFilterOption`. That is the seam this item was
split along — the original version had CRM-specific builders hardcoded into
this file, which is what kept it from being distributable.

`buildMultiSelectFilter` sets `activeCount` to the number of selected values,
so the badge counts selections rather than counting the filter as one.

## Two fixes applied during extraction

**The scroll container is now owned by `data-table.tsx`.** The virtualizer
measures scrolling against a container element. The original relied on a
locally extended `<Table>` that accepted `wrapperRef` / `wrapperClassName` /
`wrapperStyle`; stock shadcn `<Table>` hardcodes its wrapper as
`overflow-x-auto` with no ref. A previous port had worked around this by
passing `ref` to `<Table>`, which puts a div ref on the `<table>` element and
leaves the virtualizer measuring the wrong node. This version renders its own
`overflow-auto` container, so it works against a stock `table.tsx` with no
patching.

**Empty and separator rows span visible leaf columns.** `getAllColumns().length`
overcounts once a column is hidden — which this component makes easy via
`columnDef.meta.toggleVisibility` — so it now uses `getVisibleLeafColumns()`.

## Column meta

```ts
declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    toggleVisibility?: boolean   // show a "Hide" item in the column header menu
  }
}
```

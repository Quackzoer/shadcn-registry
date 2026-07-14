import { createContext, useContext } from 'react'
import { createStore, StoreApi, useStore } from 'zustand'
import {
    ColumnFiltersState,
    ColumnPinningState,
    RowSelectionState,
    SortingState,
    Table,
    VisibilityState,
} from '@tanstack/react-table'

export interface RowGroup<TData> {
    predicate: (data: TData) => boolean
    separatorLabel?: string
}

type Updater<T> = T | ((prev: T) => T)

function applyUpdater<T>(updater: Updater<T>, prev: T): T {
    return typeof updater === 'function' ? (updater as (prev: T) => T)(prev) : updater
}

export interface DataTableStoreState {
    sorting: SortingState
    setSorting: (updater: Updater<SortingState>) => void
    columnFilters: ColumnFiltersState
    setColumnFilters: (updater: Updater<ColumnFiltersState>) => void
    columnVisibility: VisibilityState
    setColumnVisibility: (updater: Updater<VisibilityState>) => void
    rowSelection: RowSelectionState
    setRowSelection: (updater: Updater<RowSelectionState>) => void
    columnPinning: ColumnPinningState
    setColumnPinning: (updater: Updater<ColumnPinningState>) => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rowGroup: RowGroup<any> | undefined
}

export function createDataTableStore(initial: {
    columnPinning: ColumnPinningState
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rowGroup: RowGroup<any> | undefined
}) {
    return createStore<DataTableStoreState>((set) => ({
        sorting: [],
        setSorting: (u) => set((s) => ({ sorting: applyUpdater(u, s.sorting) })),
        columnFilters: [],
        setColumnFilters: (u) => set((s) => ({ columnFilters: applyUpdater(u, s.columnFilters) })),
        columnVisibility: {},
        setColumnVisibility: (u) => set((s) => ({ columnVisibility: applyUpdater(u, s.columnVisibility) })),
        rowSelection: {},
        setRowSelection: (u) => set((s) => ({ rowSelection: applyUpdater(u, s.rowSelection) })),
        columnPinning: initial.columnPinning,
        setColumnPinning: (u) => set((s) => ({ columnPinning: applyUpdater(u, s.columnPinning) })),
        rowGroup: initial.rowGroup,
    }))
}

export const DataTableStoreContext = createContext<StoreApi<DataTableStoreState> | null>(null)
// Wrapped in an object so a fresh reference is provided on every render. The `Table`
// instance from useReactTable is stable and mutated in place, so passing it directly
// would make React bail out of notifying context consumers when its internal state
// (sorting, visibility, etc.) changes.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DataTableInstanceContext = createContext<{ table: Table<any> } | null>(null)

export function useDataTableStore<T>(selector: (state: DataTableStoreState) => T): T {
    const store = useContext(DataTableStoreContext)
    if (!store) throw new Error('useDataTableStore must be used within DataTableProvider')
    return useStore(store, selector)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDataTable<TData = any>(): Table<TData> {
    const ctx = useContext(DataTableInstanceContext)
    if (!ctx) throw new Error('useDataTable must be used within DataTableProvider')
    return ctx.table as Table<TData>
}
import {
    ColumnDef,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    Row,
    RowData,
    useReactTable,
} from '@tanstack/react-table'
import { ReactNode, useEffect, useState } from 'react'
import { useStore } from 'zustand'
import {
    createDataTableStore,
    DataTableInstanceContext,
    DataTableStoreContext,
    RowGroup,
} from './data-table-context'

function buildInitialPinning<TData, TValue>(columns: ColumnDef<TData, TValue>[]) {
    const left: string[] = []
    const right: string[] = []
    for (const col of columns) {
        const pin = col.meta?.pin
        const id = (col as { id?: string }).id ?? (col as { accessorKey?: string }).accessorKey
        if (!id || !pin) continue
        if (pin === 'left') left.push(id)
        else right.push(id)
    }
    return { left, right }
}

interface DataTableProviderProps<TData extends RowData, TValue> {
    data: TData[]
    columns: ColumnDef<TData, TValue>[]
    enableRowSelection?: boolean | ((row: Row<TData>) => boolean)
    rowGroup?: RowGroup<TData>
    children: ReactNode
    getStore?: (store: ReturnType<typeof createDataTableStore>) => void  
}

export function DataTableProvider<TData extends RowData, TValue>({
    data,
    columns,
    enableRowSelection,
    rowGroup,
    children,
    getStore,
}: Readonly<DataTableProviderProps<TData, TValue>>) {
    const [store] = useState(() =>
        createDataTableStore({
            columnPinning: buildInitialPinning(columns),
            rowGroup,
        })
    )
    useEffect(() => {
        store.setState({ rowGroup })
        getStore?.(store)
    }, [store, rowGroup, getStore])

    const sorting = useStore(store, (s) => s.sorting)
    const setSorting = useStore(store, (s) => s.setSorting)
    const columnFilters = useStore(store, (s) => s.columnFilters)
    const setColumnFilters = useStore(store, (s) => s.setColumnFilters)
    const columnVisibility = useStore(store, (s) => s.columnVisibility)
    const setColumnVisibility = useStore(store, (s) => s.setColumnVisibility)
    const rowSelection = useStore(store, (s) => s.rowSelection)
    const setRowSelection = useStore(store, (s) => s.setRowSelection)
    const columnPinning = useStore(store, (s) => s.columnPinning)
    const setColumnPinning = useStore(store, (s) => s.setColumnPinning)

    const table = useReactTable<TData>({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onColumnPinningChange: setColumnPinning,
        enableRowSelection: enableRowSelection ?? true,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            columnPinning,
            rowSelection,
        },
    })
    return (
        <DataTableStoreContext.Provider value={store}>
            <DataTableInstanceContext.Provider value={{ table }}>
                {children}
            </DataTableInstanceContext.Provider>
        </DataTableStoreContext.Provider>
    )
}
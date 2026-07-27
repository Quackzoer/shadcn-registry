import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { RowGroup, useDataTable, useDataTableStore } from './data-table-context'
import { cn } from '@/lib/utils'
import { Column, flexRender, Row, RowData, Table as TableType } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { CSSProperties, RefObject, useEffect, useRef, useState } from 'react'

declare module '@tanstack/react-table' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface ColumnMeta<TData extends RowData, TValue> {
        pin?: 'left' | 'right'
        toggleVisibility?: boolean
    }
}

function getPinnedStyles<TData>(column: Column<TData>): CSSProperties {
    const isPinned = column.getIsPinned()
    if (!isPinned) return {}
    return {
        position: 'sticky',
        left: isPinned === 'left' ? column.getStart('left') : undefined,
        right: isPinned === 'right' ? column.getAfter('right') : undefined,
        zIndex: 1,
        backgroundColor: 'hsl(var(--background))',
    }
}

export function DataTable() {
    const table = useDataTable()
    useEffect(()=>{
        console.log('Table changed')
        console.log(table.getAllColumns())
    },[table])
    const rowGroup = useDataTableStore((s) => s.rowGroup)

    const tableContainerRef = useRef<HTMLDivElement>(undefined)
    const outerRef = useRef<HTMLDivElement>(null)
    const [containerWidth, setContainerWidth] = useState<number | undefined>(undefined)
    const [widthCalculated, setWidthCalculated] = useState(false)

    useEffect(() => {
        const el = outerRef.current
        if (!el) return
        const observer = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width))
        observer.observe(el)
        setWidthCalculated(true)
        return () => observer.disconnect()
    }, [])

    return (
        <div className="flex-1 min-w-0 min-h-0 overflow-hidden border rounded-md" ref={outerRef}>
            {widthCalculated && (
                <Table
                    ref={tableContainerRef} // previously it was 'wrapperRef' so it might be that Table component was modified
                    wrapperClassName="h-full"
                    wrapperStyle={{ width: containerWidth }}
                    className="table-fixed"
                    style={{ minWidth: table.getTotalSize() }}
                >
                    <TableHeader className="sticky top-0 z-10 bg-background">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        style={{
                                            width: header.getSize(),
                                            ...getPinnedStyles(header.column),
                                            zIndex: header.column.getIsPinned() ? 20 : undefined,
                                        }}
                                        className={cn(header.column.getIsPinned() && 'border-l')}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <VirtualizedTableBody
                        table={table}
                        tableContainerRef={tableContainerRef}
                        rowGroup={rowGroup}
                    />
                </Table>
            )}
        </div>
    )
}

type VirtualItem<TData> = { type: 'row'; row: Row<TData> } | { type: 'separator'; label?: string }

interface VirtualizedTableBodyProps<TData> {
    table: TableType<TData>
    tableContainerRef: RefObject<HTMLDivElement>
    rowGroup?: RowGroup<TData>
}

function VirtualizedTableBody<TData>({
    table,
    tableContainerRef: ref,
    rowGroup,
}: Readonly<VirtualizedTableBodyProps<TData>>) {
    const { rows } = table.getRowModel()

    const virtualItems: VirtualItem<TData>[] = rowGroup
        ? (() => {
              const primary: VirtualItem<TData>[] = []
              const secondary: VirtualItem<TData>[] = []
              for (const row of rows) {
                  if (rowGroup.predicate(row.original)) {
                      secondary.push({ type: 'row', row })
                  } else {
                      primary.push({ type: 'row', row })
                  }
              }
              if (primary.length > 0 && secondary.length > 0) {
                  return [...primary, { type: 'separator', label: rowGroup.separatorLabel }, ...secondary]
              }
              return [...primary, ...secondary]
          })()
        : rows.map((row) => ({ type: 'row' as const, row }))

    const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
        count: virtualItems.length,
        estimateSize: (i) => (virtualItems[i]?.type === 'separator' ? 36 : 45),
        getScrollElement: () => ref?.current,
        overscan: 5,
        measureElement:
            globalThis.window !== undefined && navigator.userAgent.indexOf('Firefox') === -1
                ? (element) => element?.getBoundingClientRect().height
                : undefined,
    })

    const virtualRows = rowVirtualizer.getVirtualItems()
    const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0
    const paddingBottom =
        virtualRows.length > 0 ? rowVirtualizer.getTotalSize() - (virtualRows.at(-1)?.end ?? 0) : 0
    const colSpan = table.getAllColumns().length

    return (
        <TableBody>
            {virtualRows.length ? (
                <>
                    {paddingTop > 0 && (
                        <TableRow>
                            <TableCell colSpan={colSpan} style={{ height: paddingTop, padding: 0 }} />
                        </TableRow>
                    )}
                    {virtualRows.map((virtualRow) => {
                        const item = virtualItems[virtualRow.index]
                        if (item.type === 'separator') {
                            return (
                                <TableRow
                                    key="group-separator"
                                    data-index={virtualRow.index}
                                    ref={rowVirtualizer.measureElement}
                                >
                                    <TableCell colSpan={colSpan} className="py-1.5 px-3 bg-muted/50">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-px bg-border" />
                                            {item.label && (
                                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {item.label}
                                                </span>
                                            )}
                                            <div className="flex-1 h-px bg-border" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        }
                        const { row } = item
                        return (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && 'selected'}
                                data-index={virtualRow.index}
                                ref={rowVirtualizer.measureElement}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id} style={getPinnedStyles(cell.column)}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        )
                    })}
                    {paddingBottom > 0 && (
                        <TableRow>
                            <TableCell colSpan={colSpan} style={{ height: paddingBottom, padding: 0 }} />
                        </TableRow>
                    )}
                </>
            ) : (
                <TableRow>
                    <TableCell colSpan={colSpan} className="h-24 text-center">
                        No results.
                    </TableCell>
                </TableRow>
            )}
        </TableBody>
    )
}

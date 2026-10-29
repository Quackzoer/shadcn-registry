import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { useDataTable } from './data-table-context'
import { Search } from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'
import { useEffect, useRef } from 'react'

interface DataTableSearchProps {
    columnName: string
    /** nuqs URL param key. Defaults to columnName. Use a unique key when multiple tables share a page. */
    queryKey?: string
    placeholder?: string
    className?: string
}

export function DataTableSearch({
    columnName,
    queryKey,
    placeholder = 'Search...',
    className,
}: Readonly<DataTableSearchProps>) {
    const table = useDataTable()
    const [value, setValue] = useQueryState(queryKey ?? columnName, parseAsString)

    // Use a ref so the effect doesn't re-run every time the table instance changes
    // (useReactTable returns a new object each render)
    const tableRef = useRef(table)
    tableRef.current = table

    useEffect(() => {
        tableRef.current.getColumn(columnName)?.setFilterValue(value ?? undefined)
    }, [value, columnName])

    const resultCount = table.getFilteredRowModel().rows.length

    return (
        <InputGroup className={className}>
            <InputGroupInput
                placeholder={placeholder}
                value={value ?? ''}
                onChange={(e) => setValue(e.target.value || null)}
            />
            <InputGroupAddon>
                <Search />
            </InputGroupAddon>
            <InputGroupAddon align="inline-end" className="text-xs">
                {(value?.trim().length ?? 0) > 0 && `${resultCount} results`}
            </InputGroupAddon>
        </InputGroup>
    )
}

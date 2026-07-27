import React, { ReactNode, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Filter } from 'lucide-react';
import { Table as TableType } from '@tanstack/react-table';
import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxChipsInput,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxItem,
    ComboboxList,
    ComboboxValue,
    useComboboxAnchor,
} from '@/registry/combobox/components/combobox';

/**
 * A single entry in the filters popover.
 *
 * `component` is rendered as-is, so a filter can be anything — this file ships
 * two builders for the common shapes, but an app is expected to write its own
 * domain-specific builders and pass them in alongside.
 */
export interface TableFilterOption {
    key: string;
    isActive: boolean;
    /** When set, contributes this number to the indicator instead of 1/0 from isActive. */
    activeCount?: number;
    component: ReactNode;
}

interface TableFiltersPopoverProps {
    filters: TableFilterOption[];
}

/**
 * The generic shell: a trigger button with an active-filter count badge, and a
 * popover that renders each filter's component separated by dividers.
 *
 * It knows nothing about what the filters do — that is entirely in the
 * `component` each option supplies.
 */
export function TableFiltersPopover({ filters }: Readonly<TableFiltersPopoverProps>) {
    const activeCount = filters.reduce((sum, f) => sum + (f.activeCount ?? (f.isActive ? 1 : 0)), 0);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="relative gap-2">
                    <Filter className="size-4" />
                    Filters
                    {activeCount > 0 && (
                        <div className="absolute top-0 right-0 grid p-0 px-1 text-xs text-white bg-red-500 rounded-3xl min-w-4 translate-x-1/3 -translate-y-1/3 place-items-center">
                            {activeCount}
                        </div>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto min-w-56">
                <div className="flex flex-col gap-3">
                    {filters.map((filter, i) => (
                        <React.Fragment key={filter.key}>
                            {filter.component}
                            {i < filters.length - 1 && <Separator />}
                        </React.Fragment>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic builders
//
// These cover the two shapes that come up constantly. Anything domain-specific
// (filtering by a CRM system, a connection, a tenant…) belongs in your app as
// its own `build*Filter` function returning a TableFilterOption.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single on/off checkbox bound to a column's filter value.
 *
 * Sets the filter to `true` when checked and `undefined` when not, so an
 * unchecked box removes the filter rather than filtering for `false`.
 */
export function buildCheckboxFilter<TData>({
    table,
    columnId,
    label,
}: {
    table: TableType<TData>;
    columnId: string;
    label: string;
}): TableFilterOption {
    const isActive = !!table.getColumn(columnId)?.getFilterValue();
    const inputId = `${columnId}-filter`;

    return {
        key: columnId,
        isActive,
        component: (
            <div className="flex items-center gap-2">
                <Checkbox
                    id={inputId}
                    checked={isActive}
                    onCheckedChange={(checked) => {
                        table.getColumn(columnId)?.setFilterValue(checked || undefined);
                    }}
                    className="size-5"
                />
                <Label htmlFor={inputId} className="text-sm cursor-pointer">
                    {label}
                </Label>
            </div>
        ),
    };
}

export interface MultiSelectFilterOption<TId extends string | number> {
    id: TId;
    name: string | null;
}

function MultiSelectFilterContent<TId extends string | number>({
    label,
    options,
    value,
    onChange,
    emptyMessage,
}: {
    label: string;
    options: MultiSelectFilterOption<TId>[];
    value: TId[];
    onChange: (value: TId[]) => void;
    emptyMessage: string;
}) {
    const anchor = useComboboxAnchor();
    const [selected, setSelected] = useState<TId[]>(value);

    const handleChange = (vals: TId[]) => {
        setSelected(vals);
        onChange(vals);
    };

    return (
        <div className="flex flex-col gap-2" ref={anchor}>
            <p className="text-xs font-medium tracking-wide uppercase text-muted-foreground">{label}</p>
            <Combobox
                multiple
                autoHighlight
                items={options}
                // Base UI infers the item type from `value` (TId[]) rather than
                // `items` once the option type is generic, so this widens first.
                itemToStringValue={(o: unknown) => (o as MultiSelectFilterOption<TId>).name ?? ''}
                value={selected}
                onValueChange={(vals) => handleChange(vals as TId[])}
            >
                <ComboboxChips className="w-full max-w-xs">
                    <ComboboxValue>
                        <>
                            {selected.map((id) => (
                                <ComboboxChip key={id}>
                                    {options.find((o) => o.id === id)?.name ?? id}
                                </ComboboxChip>
                            ))}
                        </>
                        <ComboboxChipsInput />
                    </ComboboxValue>
                </ComboboxChips>
                <ComboboxContent anchor={anchor} className={'overflow-y-scroll'}>
                    <ComboboxList>
                        {(item) => {
                            const option = item as MultiSelectFilterOption<TId>;
                            return (
                                <ComboboxItem key={option.id} value={option.id}>
                                    {option.name ?? option.id}
                                </ComboboxItem>
                            );
                        }}
                    </ComboboxList>
                    <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
                </ComboboxContent>
            </Combobox>
        </div>
    );
}

/**
 * A multi-select combobox bound to a column's filter value, rendering the
 * selection as removable chips.
 *
 * `activeCount` reports the number of selected values so the popover badge
 * counts each selection rather than counting the whole filter as one.
 */
export function buildMultiSelectFilter<TData, TId extends string | number>({
    table,
    columnId,
    label,
    options,
    emptyMessage = 'No options',
}: {
    table: TableType<TData>;
    columnId: string;
    label: string;
    options: MultiSelectFilterOption<TId>[];
    emptyMessage?: string;
}): TableFilterOption {
    const filterValue = (table.getColumn(columnId)?.getFilterValue() as TId[] | undefined) ?? [];

    return {
        key: columnId,
        isActive: filterValue.length > 0,
        activeCount: filterValue.length,
        component: (
            <MultiSelectFilterContent
                label={label}
                options={options}
                value={filterValue}
                emptyMessage={emptyMessage}
                onChange={(vals) => {
                    table.getColumn(columnId)?.setFilterValue(vals.length ? vals : undefined);
                }}
            />
        ),
    };
}

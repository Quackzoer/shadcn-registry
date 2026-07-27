import React, { ReactNode, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Filter } from 'lucide-react';
import { Table as TableType } from '@tanstack/react-table';
import { CrmSystemCheckboxSelectSanitized } from '@/features/crm/components/organisms/CrmSystemCheckboxSelectSanitized';
import { CrmSystemIds } from '@/features/crm_system/lib/_core/crmSystem/crmSystem.types.gen';
import { Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxContent, ComboboxEmpty, ComboboxItem, ComboboxList, ComboboxValue, useComboboxAnchor } from '@/components/ui/combobox';
import { CRM_NAMING } from '@/constants/crm/_shared/naming';

interface ConnectionOption {
    id: number;
    name: string | null;
}

interface ProjectConnectionOption {
    id: number;
    name: string | null;
    connectionName: string | null;
}

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

export function buildCrmSystemFilter<TData>(table: TableType<TData>): TableFilterOption {
    const filterValue = table.getColumn('crm_system')?.getFilterValue() as CrmSystemIds[] | undefined;
    const recordsByCrm = table.getPreFilteredRowModel().rows.reduce(
        (acc, row) => {
            const sys = (row.original as Record<string, unknown>)['crm_system'] as string | undefined;
            if (sys) acc[sys] = (acc[sys] ?? 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );

    return {
        key: 'crm_system',
        isActive: !!(filterValue?.length),
        component: (
            <div className="flex flex-col gap-2">
                <p className="text-xs font-medium tracking-wide uppercase text-muted-foreground">CRM System</p>
                <CrmSystemCheckboxSelectSanitized
                    className="flex-wrap"
                    checkedSystemsIds={filterValue ?? []}
                    handleCheckboxChange={(id: CrmSystemIds, checked: boolean) => {
                        table.getColumn('crm_system')?.setFilterValue(
                            (prev: CrmSystemIds[] = []) =>
                                checked ? [...prev, id] : prev.filter((i) => i !== id)
                        );
                    }}
                    recordsByCrm={recordsByCrm}
                />
            </div>
        ),
    };
}

export function buildWithoutConnectionsFilter<TData>(
    table: TableType<TData>,
    label = 'Without connections only'
): TableFilterOption {
    const isActive = !!table.getColumn('without_connections')?.getFilterValue();

    return {
        key: 'without_connections',
        isActive,
        component: (
            <div className="flex items-center gap-2">
                <Checkbox
                    id="without-connections-filter"
                    checked={isActive}
                    onCheckedChange={(checked) => {
                        table.getColumn('without_connections')?.setFilterValue(checked || undefined);
                    }}
                    className="size-5"
                />
                <Label htmlFor="without-connections-filter" className="text-sm cursor-pointer">
                    {label}
                </Label>
            </div>
        ),
    };
}

function ConnectionsFilterContent({
    connections,
    value,
    onChange,
}: {
    connections: ConnectionOption[];
    value: number[];
    onChange: (value: number[]) => void;
}) {
    const anchor = useComboboxAnchor();
    const [selected, setSelected] = useState<number[]>(value);

    const handleChange = (vals: number[]) => {
        setSelected(vals);
        onChange(vals);
    };

    return (
        <div className="flex flex-col gap-2" ref={anchor}>
            <p className="text-xs font-medium tracking-wide uppercase text-muted-foreground">{CRM_NAMING.crm}</p>
            <Combobox
                multiple
                autoHighlight
                items={connections}
                itemToStringValue={(c) => c.name ?? ''}
                value={selected}
                onValueChange={(vals) => handleChange(vals as number[])}
            >
                <ComboboxChips className="w-full max-w-xs">
                    <ComboboxValue>
                        <>
                            {selected.map((id) => (
                                <ComboboxChip key={id}>
                                    {connections.find((c) => c.id === id)?.name ?? id}
                                </ComboboxChip>
                            ))}
                        </>
                        <ComboboxChipsInput />
                    </ComboboxValue>
                </ComboboxChips>
                <ComboboxContent anchor={anchor} className={'overflow-y-scroll'}>
                    <ComboboxList>
                        {(item) => {
                            const conn = item as ConnectionOption;
                            return (
                                <ComboboxItem key={conn.id} value={conn.id}>
                                    {conn.name ?? conn.id}
                                </ComboboxItem>
                            );
                        }}
                    </ComboboxList>
                    <ComboboxEmpty>No connections</ComboboxEmpty>
                </ComboboxContent>
            </Combobox>
        </div>
    );
}

function ProjectConnectionsFilterContent({
    projectConnections,
    value,
    onChange,
}: {
    projectConnections: ProjectConnectionOption[];
    value: number[];
    onChange: (value: number[]) => void;
}) {
    const anchor = useComboboxAnchor();
    const [selected, setSelected] = useState<number[]>(value);

    const handleChange = (vals: number[]) => {
        setSelected(vals);
        onChange(vals);
    };

    return (
        <div className="flex flex-col gap-2" 
        ref={anchor}
        >
            <p className="text-xs font-medium tracking-wide uppercase text-muted-foreground">{CRM_NAMING.project}</p>
            <Combobox
                multiple
                autoHighlight
                items={projectConnections}
                itemToStringValue={(p) => p.name ?? ''}
                value={selected}
                onValueChange={(vals) => handleChange(vals as number[])}
            >
                <ComboboxChips  className="w-full max-w-xs">
                    <ComboboxValue>
                        <>
                            {selected.map((id) => (
                                <ComboboxChip key={id}>
                                    {projectConnections.find((p) => p.id === id)?.name ?? id}
                                </ComboboxChip>
                            ))}
                        </>
                        <ComboboxChipsInput />
                    </ComboboxValue>
                </ComboboxChips>
                <ComboboxContent 
                anchor={anchor}
                className={'overflow-y-scroll'}
                >
                    <ComboboxList>
                        {(item) => {
                            const proj = item as ProjectConnectionOption;
                            return (
                                <ComboboxItem key={proj.id} value={proj.id}>
                                    {proj.name ?? proj.id}
                                    {proj.connectionName && (
                                        <span className="ml-auto text-xs text-muted-foreground">{proj.connectionName}</span>
                                    )}
                                </ComboboxItem>
                            );
                        }}
                    </ComboboxList>
                    <ComboboxEmpty>No project connections</ComboboxEmpty>
                </ComboboxContent>
            </Combobox>
        </div>
    );
}

export function buildConnectionsFilter({
    connections,
    value,
    onChange,
}: {
    connections: ConnectionOption[];
    value: number[];
    onChange: (value: number[]) => void;
}): TableFilterOption {
    return {
        key: 'connections',
        isActive: value.length > 0,
        component: <ConnectionsFilterContent connections={connections} value={value} onChange={onChange} />,
    };
}

export function buildProjectConnectionsFilter({
    projectConnections,
    value,
    onChange,
}: {
    projectConnections: ProjectConnectionOption[];
    value: number[];
    onChange: (value: number[]) => void;
}): TableFilterOption {
    return {
        key: 'project_connections',
        isActive: value.length > 0,
        component: <ProjectConnectionsFilterContent projectConnections={projectConnections} value={value} onChange={onChange} />,
    };
}

export function buildNuqsWithoutConnectionFilter({
    value,
    onChange,
    label = 'Show projects without connection',
}: {
    value: boolean;
    onChange: (value: boolean) => void;
    label?: string;
}): TableFilterOption {
    return {
        key: 'nuqs_without_connection',
        isActive: value,
        component: (
            <div className="flex items-center gap-2">
                <Checkbox
                    id="nuqs-without-connection-filter"
                    checked={value}
                    onCheckedChange={(checked) => onChange(!!checked)}
                    className="size-5"
                />
                <Label htmlFor="nuqs-without-connection-filter" className="text-sm cursor-pointer">
                    {label}
                </Label>
            </div>
        ),
    };
}

export function buildNuqsCrmSystemFilter({
    value,
    onChange,
    recordsByCrm,
}: {
    value: CrmSystemIds[];
    onChange: (ids: CrmSystemIds[]) => void;
    recordsByCrm?: Record<string, number>;
}): TableFilterOption {
    return {
        key: 'nuqs_crm_system',
        isActive: value.length > 0,
        component: (
            <div className="flex flex-col gap-2">
                <p className="text-xs font-medium tracking-wide uppercase text-muted-foreground">CRM System</p>
                <CrmSystemCheckboxSelectSanitized
                    className="flex-wrap"
                    checkedSystemsIds={value}
                    handleCheckboxChange={(id: CrmSystemIds, checked: boolean) => {
                        onChange(checked ? [...value, id] : value.filter((i) => i !== id));
                    }}
                    recordsByCrm={recordsByCrm ?? {}}
                />
            </div>
        ),
    };
}

export function buildConnectionsGroupFilter({
    connections,
    projectConnections,
    connectionValue,
    projectConnectionValue,
    withoutConnection,
    onConnectionChange,
    onProjectConnectionChange,
    onWithoutConnectionChange,
}: {
    connections: ConnectionOption[];
    projectConnections: ProjectConnectionOption[];
    connectionValue: number[];
    projectConnectionValue: number[];
    withoutConnection: boolean;
    onConnectionChange: (value: number[]) => void;
    onProjectConnectionChange: (value: number[]) => void;
    onWithoutConnectionChange: (value: boolean) => void;
}): TableFilterOption {
    const activeCount =
        (connectionValue.length > 0 ? 1 : 0) +
        (projectConnectionValue.length > 0 ? 1 : 0) +
        (withoutConnection ? 1 : 0);

    return {
        key: 'connections_group',
        isActive: activeCount > 0,
        activeCount,
        component: (
            <div className="flex flex-col gap-2">
                <p className="text-xs font-medium tracking-wide uppercase text-muted-foreground">Filters for {CRM_NAMING.crm}(s)</p>
                <ConnectionsFilterContent
                    connections={connections}
                    value={connectionValue}
                    onChange={onConnectionChange}
                />
                <ProjectConnectionsFilterContent
                    projectConnections={projectConnections}
                    value={projectConnectionValue}
                    onChange={onProjectConnectionChange}
                />
                <div className="flex items-center gap-2 my-0.5">
                    <div className="flex-1 border-t border-border" />
                    <span className="px-1 text-xs text-muted-foreground">or</span>
                    <div className="flex-1 border-t border-border" />
                </div>
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="connections-group-without-filter"
                        checked={withoutConnection}
                        onCheckedChange={(checked) => onWithoutConnectionChange(!!checked)}
                        className="size-5 shrink-0"
                    />
                    <Label htmlFor="connections-group-without-filter" className="text-sm cursor-pointer">
                        Include projects without a connection
                    </Label>
                </div>
            </div>
        ),
    };
}

export function buildNuqsWithoutConnectionOnlyFilter({
    value,
    onChange,
}: {
    value: boolean;
    onChange: (value: boolean) => void;
}): TableFilterOption {
    return {
        key: 'nuqs_without_connection_only',
        isActive: value,
        component: (
            <div className="flex items-start gap-2">
                <Checkbox
                    id="nuqs-without-connection-only-filter"
                    checked={value}
                    onCheckedChange={(checked) => onChange(!!checked)}
                    className="size-5 shrink-0 mt-0.5"
                />
                <div className="flex flex-col gap-0.5">
                    <Label htmlFor="nuqs-without-connection-only-filter" className="text-sm leading-snug cursor-pointer">
                        Unassigned projects only
                    </Label>
                    <p className="text-xs leading-snug text-muted-foreground">
                        Hides all projects that already have a connection
                    </p>
                </div>
            </div>
        ),
    };
}

export function buildFromThisProjectConnectionFilter<TData>(
    table: TableType<TData>,
    label = 'From this project connection only'
): TableFilterOption {
    const isActive = !!table.getColumn('this_project_connection')?.getFilterValue();

    return {
        key: 'this_project_connection',
        isActive,
        component: (
            <div className="flex items-center gap-2">
                <Checkbox
                    id="this-project-connection-filter"
                    checked={isActive}
                    onCheckedChange={(checked) => {
                        table.getColumn('this_project_connection')?.setFilterValue(checked || undefined);
                    }}
                    className="size-5"
                />
                <Label htmlFor="this-project-connection-filter" className="text-sm cursor-pointer">
                    {label}
                </Label>
            </div>
        ),
    };
}

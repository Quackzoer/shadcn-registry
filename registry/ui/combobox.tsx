import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, XIcon } from "lucide-react";
import React, { Dispatch, ReactNode, SetStateAction, useCallback, useState } from "react";


type Item = {
    value: string;
    label: React.ReactNode;
}

interface ComboboxContextValue {
    open: boolean
    setOpen: (open: boolean) => void
    selectedValues: Set<string>
    toggleValue: (value: string) => void
    items: Map<string, ReactNode>
    onItemAdded: (value: string, label: ReactNode) => void
    handleClose: () => void
    mode: 'single' | 'multiple';
}

const comboboxContext = React.createContext<ComboboxContextValue | undefined>(undefined);

const useComboboxContext = () => {
    const context = React.useContext(comboboxContext)
    if (context === undefined) {
        throw new Error('Combobox components must be used within a <Combobox />')
    }
    return context
};



export type ComboboxProps = {
    disabled?: boolean;
    inDialog?: boolean;
    triggerLabel: string | React.ReactNode;
    onCreate?: (value: string) => void;
    open?: boolean;
    setOpen?: (open: boolean) => void;
    // mode?: 'single' | 'multiple';
    closeOnSelect?: boolean;
    onValuesChange?: (values: string[]) => void;
    renderSelectedValue?: (selectedValue: string | string[], items: { label: string, value: string }[]) => React.ReactNode;
    children?: React.ReactNode;
    values?: string[];
    defaultValues?: string[];
}
    & ({
        mode: 'single'
        selectedValue: string | null;
        setSelectedValue: Dispatch<SetStateAction<string | null>> | ((value: string | null) => void);

    } | {
        mode: 'multiple';
        selectedValue: string | string[] | null;
        setSelectedValue: Dispatch<SetStateAction<string | string[] | null>> | ((value: string | string[] | null) => void) | ((value: string | null) => void);
    })

export default function Combobox({
    disabled = false,
    triggerLabel,
    mode = 'single',
    onValuesChange,
    open,
    setOpen,
    inDialog = false,
    onCreate,
    closeOnSelect = true,
    renderSelectedValue,
    values,
    defaultValues,
    children
}: Readonly<ComboboxProps>) {
    const [query, setQuery] = useState<string>('');
    const [internalOpen, setInternalOpen] = useState<boolean>(false);
    const [internalValues, setInternalValues] = useState(
        new Set<string>(values ?? defaultValues),
    )
    const selectedValues = values ? new Set(values) : internalValues
    const isControlled = open !== undefined && setOpen !== undefined;
    const isOpen = isControlled ? open : internalOpen;

    const [items, setItems] = useState<Map<string, ReactNode>>(new Map());

    function toggleValue(value: string) {
        const getNewSet = (prev: Set<string>) => {
            const newSet = new Set(prev)
            if (newSet.has(value)) {
                newSet.delete(value)
            } else {
                newSet.add(value)
            }
            return newSet
        }
        setInternalValues(getNewSet)
        onValuesChange?.([...getNewSet(selectedValues)])
    }
    const onItemAdded = useCallback((value: string, label: ReactNode) => {
        setItems(prev => {
            if (prev?.get(value) === label) return prev
            return new Map(prev).set(value, label)
        })
    }, [])
    const handleOpenChange = (newOpen: boolean) => {
        if (isControlled) {
            setOpen(newOpen);
        } else {
            setInternalOpen(newOpen);
        }
    };

    const handleClose = () => {
        if (closeOnSelect && mode === 'single') {
            handleOpenChange(false);
        }
    };

    return (
        <comboboxContext.Provider
            value={{ // NOSONAR
                open: isOpen,
                setOpen: handleOpenChange,
                selectedValues,
                toggleValue,
                items,
                onItemAdded,
                handleClose,
                mode
            }}
        >
            <Popover open={isOpen} onOpenChange={handleOpenChange} modal={!inDialog}>
                <PopoverTrigger asChild>
                    <Button disabled={disabled} className="justify-between w-full px-3 font-normal text-start " variant="outline">
                        {selectedValues && selectedValues.size > 0 ? (
                            <div className='relative flex flex-wrap items-center flex-grow mr-auto overflow-hidden'>
                                <span>
                                    {renderSelectedValue
                                        ? renderSelectedValue(selectedValues, items)
                                        : mode === 'multiple' && Array.isArray(selectedValues)
                                            ? Array.from(selectedValues)
                                                .map(
                                                    (selectedValue: string) =>
                                                        items.find((item) => item.value === selectedValue)
                                                            ?.label
                                                )
                                                .join(', ')
                                            : items.find((item) => item.value === selectedValue)?.label}
                                </span>
                            </div>
                        ) : (
                            triggerLabel ?? 'Select Item...'
                        )}
                        <ChevronsUpDown className='w-4 h-4 ml-2 opacity-50 shrink-0' />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-1 PopoverContent">
                    <Command
                        filter={(value, search) => {
                            if (value.toLocaleLowerCase().includes(search.toLocaleLowerCase())) return 1;
                            return 0;
                        }}
                    >
                        <CommandInput placeholder="Search..." value={query} onValueChange={(value: string) => setQuery(value)} />
                        <CommandList >
                            <CommandEmpty
                                onClick={() => {
                                    if (onCreate) {
                                        onCreate(query);
                                        setQuery('');
                                        handleClose();
                                    }
                                }}
                            >
                                {onCreate ? (
                                    <div className="flex gap-2 px-2">
                                        <p>Create: </p>
                                        <p className='block font-semibold truncate max-w-48 text-primary'>
                                            {query}
                                        </p>
                                    </div>
                                ) : (
                                    'Not found'
                                )}
                            </CommandEmpty>
                            <CommandGroup >
                                <ScrollArea className="h-[280px]" type="always">
                                    {children}
                                </ScrollArea>
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </comboboxContext.Provider>
    )
}


export function ComboboxItem({
    value,
    children,
    onSelect
}: Readonly<{
    value: string,
    children: React.ReactNode
    onSelect?: (value: string) => void
}>) {
    const { onItemAdded, selectedValues, toggleValue, handleClose, mode } = useComboboxContext();
    const isSelected = selectedValues.has(value)
    React.useEffect(() => {
        onItemAdded(value, children);
    }, [value, children, onItemAdded]);

    return (
        <CommandItem
            value={value}
            onSelect={(value) => {
                toggleValue(value);
                onSelect?.(value);
                handleClose();
            }}
        >
            {mode === 'multiple' && (
                <div className={cn(
                    "flex items-center justify-center w-4 h-4 mr-2 border border-gray-300 rounded-sm shrink-0",
                    isSelected ? "bg-primary" : "bg-lighter-gray"
                )}>
                    <Check className={cn(
                        "text-white",
                        isSelected ? "opacity-100" : "opacity-0"
                    )} />
                </div>
            )}
            {children}
        </CommandItem>
    )
}

interface ComboboxSelectedValueProps {
    placeholder?: string | React.ReactNode;
    clickToRemove?: boolean;
}

export function ComboboxSelectedValue({ placeholder = 'Select Item...', clickToRemove = false }: Readonly<ComboboxSelectedValueProps>) {
    const { selectedValues, items, toggleValue } = useComboboxContext();
    if (selectedValues.size === 0) {
        return <span>{placeholder}</span>
    }
    return (
        <Button className="justify-between w-full px-3 font-normal text-start " variant="outline">
            {[...selectedValues]
                .filter(value => items.has(value))
                .map(value => (
                    <Badge
                        variant="outline"
                        data-selected-item
                        className="group flex items-center gap-1"
                        key={value}
                        onClick={
                            clickToRemove
                                ? e => {
                                    e.stopPropagation()
                                    toggleValue(value)
                                }
                                : undefined
                        }
                    >
                        {items.get(value)}
                        {clickToRemove && (
                            <XIcon className="size-2 text-muted-foreground group-hover:text-destructive" />
                        )}
                    </Badge>
                ))}
        </Button>
    )
}
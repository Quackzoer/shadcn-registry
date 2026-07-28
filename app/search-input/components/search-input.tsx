import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { useDebouncer } from "@tanstack/react-pacer";
import { Search } from "lucide-react";
import { useState } from "react";

export interface SearchInputProps {

}

export function SearchInput(props: SearchInputProps) {
    const [query, setQuery] = useState<string>('')
    const debouncer = useDebouncer(
        setQuery,
        { wait: 500, enabled: query.value.length > 3 } // Enable/disable based on input length IF using a framework adapter that supports reactive options
    )
    return (
        <InputGroup>
            <InputGroupInput />
            <InputGroupAddon>
                <Search />
            </InputGroupAddon>
            <InputGroupAddon align="inline-end" className="text-xs">
                {(query?.trim().length ?? 0) > 0 && `${resultCount} results`}
            </InputGroupAddon>
        </InputGroup>
    )
}
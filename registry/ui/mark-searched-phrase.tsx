import { cn } from "@/lib/utils";
import { useMemo, type ComponentPropsWithoutRef, type ElementType, type ReactNode } from "react";

type MarkSearchedPhraseProps<T extends ElementType = 'p'> = {
    text: string;
    searchTerm: string | string[];
    className?: string;
    markClassName?: string;
    as?: T;
    caseSensitive?: boolean;
    renderMatch?: (text: string, index: number) => ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'text' | 'searchTerm' | 'className' | 'markClassName' | 'caseSensitive' | 'renderMatch'>;

export function MarkSearchedPhrase<T extends ElementType = 'p'>({
    text,
    searchTerm,
    className,
    markClassName,
    as,
    caseSensitive = false,
    renderMatch,
    ...props
}: MarkSearchedPhraseProps<T>) {
    const Component = (as || 'p') as ElementType;

    // Normalize searchTerm to array
    const searchTerms = useMemo(
        () => Array.isArray(searchTerm) ? searchTerm.filter(term => term !== '') : searchTerm !== '' ? [searchTerm] : [],
        [searchTerm]
    );

    // Memoize regex for performance
    const regex = useMemo(() => {
        if (searchTerms.length === 0) return null;

        const escapedTerms = searchTerms.map(term =>
            term.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`)
        );
        const pattern = `(${escapedTerms.join('|')})`;
        const flags = caseSensitive ? 'g' : 'gi';
        return new RegExp(pattern, flags);
    }, [searchTerms, caseSensitive]);

    // Early return if no search terms
    if (!regex) {
        return <Component className={cn(className)} {...props}>{text}</Component>;
    }

    // Check if text contains any search term
    const hasMatch = caseSensitive
        ? searchTerms.some(term => text.includes(term))
        : searchTerms.some(term => text.toLowerCase().includes(term.toLowerCase()));

    if (!hasMatch) {
        return <Component className={cn(className)} {...props}>{text}</Component>;
    }

    const parts = text.split(regex);

    return (
        <Component className={cn(className)} {...props}>
            {parts.map((part, index) => {
                // Check if this part matches any search term
                const isMatch = searchTerms.some(term =>
                    caseSensitive
                        ? part === term
                        : part.toLowerCase() === term.toLowerCase()
                );

                if (isMatch) {
                    // Use custom render function if provided
                    if (renderMatch) {
                        return <span key={index}>{renderMatch(part, index)}</span>;
                    }

                    // Use semantic <mark> element for accessibility
                    return (
                        <mark
                            key={index}
                            className={cn(
                                'relative before:absolute before:rounded-md before:-left-[2px] before:-right-[2px] before:inset-y-0 before:bg-primary/30',
                                markClassName
                            )}
                            aria-label="Search result match"
                        >
                            {part}
                        </mark>
                    );
                }

                return <span key={index}>{part}</span>;
            })}
        </Component>
    );
}
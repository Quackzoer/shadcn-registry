import { cn } from "@/lib/utils";

interface MarkSearchedPhraseProps {
    text: string;
    searchTerm: string;
    className?: string;
    markClassName?: string;
}

export function MarkSearchedPhrase({
    text,
    searchTerm,
    className,
    markClassName
}: Readonly<MarkSearchedPhraseProps>) {
    if (searchTerm === '') return <p key={text} className={cn(className)}>{text}</p>
    if (!text.toLowerCase().includes(searchTerm.toLowerCase())) return <p className={cn(className)} key={text}>{text}</p>
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`)})`, 'gi'); // NOSONAR
    const parts = text.split(regex);


    return (
        <p className={cn(className)} key={text}>
            {parts.map((part, index) => {
                // Check if this part matches the search term (case-insensitive)
                const isMatch = part.toLowerCase() === searchTerm.toLowerCase();

                if (isMatch) {
                    return (
                        <span key={index} className={cn('relative before:absolute before:rounded-md  before:-left-[2px] before:-right-[2px] before:inset-y-0 before:bg-primary/30', markClassName)}>
                            {part}
                        </span>
                    );
                }

                return <span key={index}>{part}</span>;
            })}
        </p>
    )
}
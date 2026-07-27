"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
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
} from "@/registry/combobox/components/combobox"

interface Framework {
  id: string
  name: string
  count: number
}

const FRAMEWORKS: Framework[] = [
  { id: "next", name: "Next.js", count: 128 },
  { id: "sveltekit", name: "SvelteKit", count: 64 },
  { id: "nuxt", name: "Nuxt", count: 47 },
  { id: "remix", name: "Remix", count: 31 },
  { id: "astro", name: "Astro", count: 22 },
  { id: "solid-start", name: "SolidStart", count: 9 },
]

export default function Page() {
  return (
    <div className="mx-auto flex min-h-svh max-w-3xl flex-col gap-10 px-4 py-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Combobox</h1>
        <p className="text-muted-foreground">
          A thin, composable wrapper over Base UI&apos;s Combobox primitives.
          Each part is a separate export, so the layout stays yours to arrange.
        </p>
      </header>

      <Section
        title="Multi select with chips"
        description="ComboboxChips holds the selected values as removable ComboboxChip elements, with ComboboxChipsInput typing alongside them. The anchor from useComboboxAnchor ties the popup to the chip container rather than the input."
      >
        <MultiSelect />
      </Section>

      <Section
        title="Custom item content"
        description="ComboboxList takes a function child, so each item renders from the items passed to the root — here with a trailing count."
      >
        <MultiSelectWithCounts />
      </Section>
    </div>
  )
}

function MultiSelect() {
  const [selected, setSelected] = useState<string[]>(["next"])
  const anchor = useComboboxAnchor()

  return (
    <div className="flex flex-col gap-2" ref={anchor}>
      <Combobox
        multiple
        autoHighlight
        items={FRAMEWORKS}
        value={selected}
        onValueChange={(values: string[]) => setSelected(values)}
      >
        <ComboboxChips className="w-full max-w-md">
          <ComboboxValue>
            <>
              {selected.map((id) => (
                <ComboboxChip key={id}>
                  {FRAMEWORKS.find((f) => f.id === id)?.name ?? id}
                </ComboboxChip>
              ))}
            </>
            <ComboboxChipsInput />
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxList>
            {(item: Framework) => (
              <ComboboxItem key={item.id} value={item.id}>
                {item.name}
              </ComboboxItem>
            )}
          </ComboboxList>
          <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
        </ComboboxContent>
      </Combobox>

      <div className="flex items-center gap-2">
        <p className="text-muted-foreground text-sm">
          {selected.length} selected
        </p>
        <Button size="sm" variant="ghost" onClick={() => setSelected([])}>
          Clear
        </Button>
      </div>
    </div>
  )
}

function MultiSelectWithCounts() {
  const [selected, setSelected] = useState<string[]>([])
  const anchor = useComboboxAnchor()

  return (
    <div className="flex flex-col gap-1" ref={anchor}>
      <Combobox
        multiple
        autoHighlight
        items={FRAMEWORKS}
        value={selected}
        onValueChange={(values: string[]) => setSelected(values)}
      >
        <ComboboxChips className="w-full max-w-md">
          <ComboboxValue>
            <>
              {selected.map((id) => (
                <ComboboxChip key={id}>
                  {FRAMEWORKS.find((f) => f.id === id)?.name ?? id}
                </ComboboxChip>
              ))}
            </>
            <ComboboxChipsInput />
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor} className="overflow-y-scroll">
          <ComboboxList>
            {(item: Framework) => (
              <ComboboxItem key={item.id} value={item.id}>
                {item.name}
                <span className="text-muted-foreground ml-auto text-xs">
                  {item.count}
                </span>
              </ComboboxItem>
            )}
          </ComboboxList>
          <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      {children}
    </section>
  )
}

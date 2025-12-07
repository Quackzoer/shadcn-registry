"use client"

import { useState } from "react"
import {
  Combobox,
  ComboboxContent,
  ComboboxGroup,
  ComboboxItem,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
} from "@/registry/ui/combobox"

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "nuxt", label: "Nuxt.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
]

const languages = [
  { value: "typescript", label: "TypeScript" },
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
]

export default function Page() {
  const [singleValue, setSingleValue] = useState<string[]>([])
  const [multipleValues, setMultipleValues] = useState<string[]>([])
  const [groupedValues, setGroupedValues] = useState<string[]>([])

  return (
    <div className="max-w-3xl mx-auto flex flex-col min-h-svh px-4 py-8 gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Combobox Examples</h1>
        <p className="text-muted-foreground">
          Composable combobox component with single and multiple selection modes.
        </p>
      </header>
      <main className="flex flex-col flex-1 gap-12">
        {/* Single Select Example */}
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-semibold">Single Select</h2>
            <p className="text-sm text-muted-foreground">
              Select a single framework from the list
            </p>
          </div>
          <Combobox
            mode="single"
            values={singleValue}
            onValuesChange={setSingleValue}
          >
            <ComboboxTrigger className="w-[300px]">
              <ComboboxValue placeholder="Select a framework..." />
            </ComboboxTrigger>
            <ComboboxContent search={{ placeholder: "Search frameworks...", emptyMessage: "No framework found." }}>
              <ComboboxGroup>
                {frameworks.map((framework) => (
                  <ComboboxItem key={framework.value} value={framework.value}>
                    {framework.label}
                  </ComboboxItem>
                ))}
              </ComboboxGroup>
            </ComboboxContent>
          </Combobox>
          <p className="text-sm text-muted-foreground">
            Selected: {singleValue.length > 0 ? singleValue[0] : "None"}
          </p>
        </section>

        {/* Multiple Select Example */}
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-semibold">Multiple Select</h2>
            <p className="text-sm text-muted-foreground">
              Select multiple programming languages
            </p>
          </div>
          <Combobox
            mode="multiple"
            values={multipleValues}
            onValuesChange={setMultipleValues}
          >
            <ComboboxTrigger className="w-[400px]">
              <ComboboxValue
                placeholder="Select languages..."
                clickToRemove={true}
                overflowBehavior="wrap-when-open"
              />
            </ComboboxTrigger>
            <ComboboxContent search={{ placeholder: "Search languages...", emptyMessage: "No language found." }}>
              <ComboboxGroup>
                {languages.map((language) => (
                  <ComboboxItem key={language.value} value={language.value}>
                    {language.label}
                  </ComboboxItem>
                ))}
              </ComboboxGroup>
            </ComboboxContent>
          </Combobox>
          <p className="text-sm text-muted-foreground">
            Selected: {multipleValues.length > 0 ? multipleValues.join(", ") : "None"}
          </p>
        </section>

        {/* Grouped Example */}
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-semibold">With Groups & Separators</h2>
            <p className="text-sm text-muted-foreground">
              Multiple select with organized groups
            </p>
          </div>
          <Combobox
            mode="multiple"
            values={groupedValues}
            onValuesChange={setGroupedValues}
          >
            <ComboboxTrigger className="w-[400px]">
              <ComboboxValue
                placeholder="Select technologies..."
                clickToRemove={true}
                overflowBehavior="cutoff"
              />
            </ComboboxTrigger>
            <ComboboxContent search>
              <ComboboxGroup heading="Frameworks">
                {frameworks.map((framework) => (
                  <ComboboxItem key={framework.value} value={framework.value}>
                    {framework.label}
                  </ComboboxItem>
                ))}
              </ComboboxGroup>
              <ComboboxSeparator />
              <ComboboxGroup heading="Languages">
                {languages.slice(0, 4).map((language) => (
                  <ComboboxItem key={language.value} value={language.value}>
                    {language.label}
                  </ComboboxItem>
                ))}
              </ComboboxGroup>
            </ComboboxContent>
          </Combobox>
          <p className="text-sm text-muted-foreground">
            Selected: {groupedValues.length > 0 ? groupedValues.join(", ") : "None"}
          </p>
        </section>
      </main>
    </div>
  )
}

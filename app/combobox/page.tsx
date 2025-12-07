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
  const [customItems, setCustomItems] = useState<{ value: string; label: string }[]>([
    { value: "react", label: "React" },
    { value: "vue", label: "Vue" },
    { value: "angular", label: "Angular" },
  ])
  const [customValues, setCustomValues] = useState<string[]>([])

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

        {/* Create New Items Example */}
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-semibold">Create New Items</h2>
            <p className="text-sm text-muted-foreground">
              Type to search or create new libraries dynamically
            </p>
          </div>
          <Combobox
            mode="multiple"
            values={customValues}
            onValuesChange={setCustomValues}
          >
            <ComboboxTrigger className="w-[400px]">
              <ComboboxValue
                placeholder="Select or create libraries..."
                clickToRemove={true}
              />
            </ComboboxTrigger>
            <ComboboxContent
              search={{ placeholder: "Search or create...", emptyMessage: "No results." }}
              onCreate={(value) => {
                const newItem = {
                  value: value.toLowerCase().replaceAll(/\s+/g, "-"),
                  label: value,
                }
                setCustomItems((prev) => [...prev, newItem])
                setCustomValues((prev) => [...prev, newItem.value])
              }}
              onCreateLabel="Create library"
            >
              <ComboboxGroup>
                {customItems.map((item) => (
                  <ComboboxItem key={item.value} value={item.value}>
                    {item.label}
                  </ComboboxItem>
                ))}
              </ComboboxGroup>
            </ComboboxContent>
          </Combobox>
          <p className="text-sm text-muted-foreground">
            Selected: {customValues.length > 0 ? customValues.join(", ") : "None"}
          </p>
          <p className="text-xs text-muted-foreground">
            Total libraries: {customItems.length}
          </p>
        </section>

        {/* Custom Styling Example */}
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-semibold">Custom Styling</h2>
            <p className="text-sm text-muted-foreground">
              Fully customizable with Tailwind classes
            </p>
          </div>
          <Combobox
            mode="single"
            values={singleValue}
            onValuesChange={setSingleValue}
          >
            <ComboboxTrigger className="w-[350px] bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-300 dark:border-purple-700 hover:from-purple-500/20 hover:to-pink-500/20">
              <ComboboxValue
                placeholder="Choose your favorite framework..."
                className="text-purple-900 dark:text-purple-100"
              />
            </ComboboxTrigger>
            <ComboboxContent
              search={{ placeholder: "Search frameworks...", emptyMessage: "Not found" }}
              className="border-purple-300 dark:border-purple-700"
            >
              <ComboboxGroup>
                {frameworks.map((framework) => (
                  <ComboboxItem
                    key={framework.value}
                    value={framework.value}
                    className="data-[selected=true]:bg-purple-100 dark:data-[selected=true]:bg-purple-900/30"
                  >
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
      </main>
    </div>
  )
}

"use client"

import { MarkSearchedPhrase } from "@/registry/ui/mark-searched-phrase"
import { Input } from "@/components/ui/input"
import { useState } from "react"

const sampleTexts = {
  short: "The quick brown fox jumps over the lazy dog.",
  medium: "React is a JavaScript library for building user interfaces. It makes building complex UIs simple by breaking them down into small, reusable components.",
  long: "TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale. TypeScript adds additional syntax to JavaScript to support a tighter integration with your editor.",
  code: "function calculateTotal(items) { return items.reduce((sum, item) => sum + item.price, 0); }",
  special: "Email: user@example.com | Price: $99.99 | Date: 2024-01-01",
}

export default function Page() {
  const [searchTerm, setSearchTerm] = useState("")
  const [customSearch, setCustomSearch] = useState("")

  return (
    <div className="max-w-4xl mx-auto flex flex-col min-h-svh px-4 py-8 gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Mark Searched Phrase</h1>
        <p className="text-muted-foreground">
          Highlight search terms within text content with custom styling.
        </p>
      </header>

      <main className="flex flex-col flex-1 gap-12">
        {/* Interactive Search */}
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-semibold">Interactive Search</h2>
            <p className="text-sm text-muted-foreground">
              Type to highlight matching text in real-time
            </p>
          </div>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Search for text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            <div className="p-4 border rounded-lg bg-card">
              <MarkSearchedPhrase
                text={sampleTexts.medium}
                searchTerm={searchTerm}
                className="text-base leading-relaxed"
              />
            </div>
          </div>
        </section>

        {/* Case Insensitive */}
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-semibold">Case Insensitive Matching</h2>
            <p className="text-sm text-muted-foreground">
              Highlights matches regardless of case
            </p>
          </div>
          <div className="p-4 border rounded-lg bg-card space-y-2">
            <MarkSearchedPhrase
              text="TypeScript is awesome! typescript makes development better. TYPESCRIPT is powerful."
              searchTerm="typescript"
              className="text-base"
            />
          </div>
        </section>

        {/* Custom Styling */}
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-semibold">Custom Highlight Styles</h2>
            <p className="text-sm text-muted-foreground">
              Different highlight styles using markClassName
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-card">
              <p className="text-xs text-muted-foreground mb-2">Default (Primary/30)</p>
              <MarkSearchedPhrase
                text={sampleTexts.short}
                searchTerm="fox"
                className="text-base"
              />
            </div>

            <div className="p-4 border rounded-lg bg-card">
              <p className="text-xs text-muted-foreground mb-2">Yellow Highlight</p>
              <MarkSearchedPhrase
                text={sampleTexts.short}
                searchTerm="quick"
                className="text-base"
                markClassName="before:bg-yellow-300 dark:before:bg-yellow-600/50"
              />
            </div>

            <div className="p-4 border rounded-lg bg-card">
              <p className="text-xs text-muted-foreground mb-2">Green Highlight with Bold</p>
              <MarkSearchedPhrase
                text={sampleTexts.short}
                searchTerm="brown"
                className="text-base"
                markClassName="before:bg-green-300 dark:before:bg-green-600/50 font-semibold"
              />
            </div>

            <div className="p-4 border rounded-lg bg-card">
              <p className="text-xs text-muted-foreground mb-2">Underline Style</p>
              <MarkSearchedPhrase
                text={sampleTexts.short}
                searchTerm="lazy"
                className="text-base"
                markClassName="before:bg-transparent border-b-2 border-blue-500"
              />
            </div>
          </div>
        </section>

        {/* Multiple Matches */}
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-semibold">Multiple Matches</h2>
            <p className="text-sm text-muted-foreground">
              Highlights all occurrences of the search term
            </p>
          </div>
          <div className="p-4 border rounded-lg bg-card">
            <MarkSearchedPhrase
              text={sampleTexts.long}
              searchTerm="TypeScript"
              className="text-base leading-relaxed"
            />
          </div>
        </section>

        {/* Special Characters */}
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-semibold">Special Characters</h2>
            <p className="text-sm text-muted-foreground">
              Properly escapes regex special characters
            </p>
          </div>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Try searching: $99.99, @example.com, (items)"
              value={customSearch}
              onChange={(e) => setCustomSearch(e.target.value)}
              className="max-w-md"
            />
            <div className="p-4 border rounded-lg bg-card">
              <MarkSearchedPhrase
                text={sampleTexts.special}
                searchTerm={customSearch}
                className="text-base font-mono"
              />
            </div>
          </div>
        </section>

        {/* Empty Search */}
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-semibold">Edge Cases</h2>
            <p className="text-sm text-muted-foreground">
              Handles empty search and no matches gracefully
            </p>
          </div>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-card">
              <p className="text-xs text-muted-foreground mb-2">Empty Search (no highlighting)</p>
              <MarkSearchedPhrase
                text={sampleTexts.short}
                searchTerm=""
                className="text-base"
              />
            </div>

            <div className="p-4 border rounded-lg bg-card">
              <p className="text-xs text-muted-foreground mb-2">No Match Found</p>
              <MarkSearchedPhrase
                text={sampleTexts.short}
                searchTerm="xyz123"
                className="text-base"
              />
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-semibold">Real-World Use Cases</h2>
            <p className="text-sm text-muted-foreground">
              Common scenarios where this component is useful
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-card">
              <p className="text-xs font-semibold mb-2">Search Results</p>
              <div className="space-y-2">
                {["React tutorial for beginners", "Advanced React patterns", "React vs Vue comparison"].map((title) => (
                  <MarkSearchedPhrase
                    key={title}
                    text={title}
                    searchTerm="react"
                    className="text-sm hover:text-primary cursor-pointer"
                  />
                ))}
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-card">
              <p className="text-xs font-semibold mb-2">Code Search</p>
              <MarkSearchedPhrase
                text={sampleTexts.code}
                searchTerm="item"
                className="text-sm font-mono bg-muted p-2 rounded"
              />
            </div>

            <div className="p-4 border rounded-lg bg-card">
              <p className="text-xs font-semibold mb-2">Documentation Search</p>
              <MarkSearchedPhrase
                text="The useState hook allows you to add state to functional components. It returns an array with the current state value and a function to update it."
                searchTerm="state"
                className="text-sm leading-relaxed"
                markClassName="before:bg-blue-200/50 dark:before:bg-blue-800/50"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
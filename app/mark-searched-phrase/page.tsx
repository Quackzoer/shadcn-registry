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
                markClassName="bg-yellow-200/70 dark:bg-yellow-600/50"
              />
            </div>

            <div className="p-4 border rounded-lg bg-card">
              <p className="text-xs text-muted-foreground mb-2">Green Highlight with Bold</p>
              <MarkSearchedPhrase
                text={sampleTexts.short}
                searchTerm="brown"
                className="text-base"
                markClassName="bg-green-200/70 dark:bg-green-600/50 font-semibold"
              />
            </div>

            <div className="p-4 border rounded-lg bg-card">
              <p className="text-xs text-muted-foreground mb-2">Underline Style</p>
              <MarkSearchedPhrase
                text={sampleTexts.short}
                searchTerm="lazy"
                className="text-base"
                markClassName="bg-transparent border-b-2 border-blue-500"
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
                markClassName="bg-blue-200/70 dark:bg-blue-800/50"
              />
            </div>
          </div>
        </section>

        {/* As Prop - Flexible Element */}
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-semibold">Flexible Element Rendering</h2>
            <p className="text-sm text-muted-foreground">
              Use the `as` prop to render as different HTML elements
            </p>
          </div>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-card">
              <p className="text-xs text-muted-foreground mb-2">As span (inline)</p>
              <div>
                This is a sentence with{" "}
                <MarkSearchedPhrase
                  as="span"
                  text="highlighted text"
                  searchTerm="highlighted"
                  className="inline"
                />
                {" "}in the middle.
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-card">
              <p className="text-xs text-muted-foreground mb-2">As div (block)</p>
              <MarkSearchedPhrase
                as="div"
                text="This renders as a div element instead of a paragraph."
                searchTerm="div"
                className="text-base p-2 bg-muted rounded"
              />
            </div>

            <div className="p-4 border rounded-lg bg-card">
              <p className="text-xs text-muted-foreground mb-2">As h3 (heading)</p>
              <MarkSearchedPhrase
                as="h3"
                text="Search Results for React"
                searchTerm="React"
                className="text-lg font-semibold"
              />
            </div>
          </div>
        </section>

        {/* Case Sensitivity */}
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-semibold">Case Sensitive Matching</h2>
            <p className="text-sm text-muted-foreground">
              Enable case-sensitive search for exact matches
            </p>
          </div>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-card">
              <p className="text-xs text-muted-foreground mb-2">Case Insensitive (default)</p>
              <MarkSearchedPhrase
                text="React, react, REACT - all match"
                searchTerm="react"
                className="text-base"
              />
            </div>

            <div className="p-4 border rounded-lg bg-card">
              <p className="text-xs text-muted-foreground mb-2">Case Sensitive</p>
              <MarkSearchedPhrase
                text="React, react, REACT - only exact case matches"
                searchTerm="React"
                caseSensitive
                className="text-base"
                markClassName="bg-orange-200/70 dark:bg-orange-600/50"
              />
            </div>
          </div>
        </section>

        {/* Multiple Search Terms */}
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-semibold">Multiple Search Terms</h2>
            <p className="text-sm text-muted-foreground">
              Highlight multiple different terms at once
            </p>
          </div>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-card">
              <p className="text-xs text-muted-foreground mb-2">Highlight React and Vue</p>
              <MarkSearchedPhrase
                text="React and Vue are both popular JavaScript frameworks for building user interfaces."
                searchTerm={["React", "Vue"]}
                className="text-base"
              />
            </div>

            <div className="p-4 border rounded-lg bg-card">
              <p className="text-xs text-muted-foreground mb-2">Highlight multiple keywords</p>
              <MarkSearchedPhrase
                text="TypeScript adds static typing to JavaScript. This helps catch errors early and improves code quality."
                searchTerm={["TypeScript", "JavaScript", "errors", "code"]}
                className="text-base leading-relaxed"
                markClassName="bg-purple-200/70 dark:bg-purple-600/50"
              />
            </div>
          </div>
        </section>

        {/* Custom Render Function */}
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-semibold">Custom Render Function</h2>
            <p className="text-sm text-muted-foreground">
              Provide a custom render function for complete control over matched text
            </p>
          </div>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-card">
              <p className="text-xs text-muted-foreground mb-2">With badge styling</p>
              <MarkSearchedPhrase
                text="React is a JavaScript library for building user interfaces"
                searchTerm="React"
                className="text-base"
                renderMatch={(text) => (
                  <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2 py-0.5 text-xs font-semibold text-blue-800 dark:text-blue-100">
                    {text}
                  </span>
                )}
              />
            </div>

            <div className="p-4 border rounded-lg bg-card">
              <p className="text-xs text-muted-foreground mb-2">With custom icon</p>
              <MarkSearchedPhrase
                text="Search for important keywords in your documentation"
                searchTerm="important"
                className="text-base"
                renderMatch={(text) => (
                  <span className="inline-flex items-center gap-1 rounded bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 font-semibold text-amber-900 dark:text-amber-100">
                    ⭐ {text}
                  </span>
                )}
              />
            </div>

            <div className="p-4 border rounded-lg bg-card">
              <p className="text-xs text-muted-foreground mb-2">With index counter</p>
              <MarkSearchedPhrase
                text="The word test appears multiple times. This is a test. Another test here."
                searchTerm="test"
                className="text-base"
                renderMatch={(text, index) => (
                  <span className="relative inline-flex items-baseline">
                    <span className="rounded bg-green-200 dark:bg-green-800 px-1.5 py-0.5 font-semibold">
                      {text}
                    </span>
                    <sup className="ml-0.5 text-xs text-green-600 dark:text-green-400">
                      {Math.floor(index / 2) + 1}
                    </sup>
                  </span>
                )}
              />
            </div>
          </div>
        </section>

        {/* Performance Note */}
        <section className="flex flex-col gap-4 pb-8">
          <div>
            <h2 className="text-xl font-semibold">Performance Optimizations</h2>
            <p className="text-sm text-muted-foreground">
              Component features built-in performance optimizations
            </p>
          </div>
          <div className="p-4 border rounded-lg bg-card">
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span>Regex is memoized and only recreated when search terms change</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span>Early returns for empty search or no matches</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span>Uses semantic &lt;mark&gt; element for better accessibility</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span>Proper React keys using index to avoid reconciliation bugs</span>
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  )
}
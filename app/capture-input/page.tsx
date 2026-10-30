"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { captureSource } from "@/registry/tanstack-form/components/fields/capture-input"
import { FormFieldLayout } from "@/registry/tanstack-form/components/fields/form-field-layout"
import { useAppForm } from "@/registry/tanstack-form/hooks/use-app-form"
import {
  composeParsers,
  createPrefixParser,
  extractCapture,
  groupTokenValues,
  projectParser,
  tagParser,
  type CaptureResult,
} from "@/registry/tanstack-form/lib/capture/capture-parser"

const PRIORITIES = ["low", "med", "high"]

// Parsers are plain functions: keep one at module scope so its identity is stable.
const parser = composeParsers(
  tagParser, // #tag
  projectParser, // @project or @"two words"
  createPrefixParser({
    trigger: "!",
    kind: "priority",
    validate: (value) => PRIORITIES.includes(value.toLowerCase()),
  }),
)

const PROJECTS = ["Website", "Home reno", "Thesis"]

export default function CaptureInputPage() {
  const [tags, setTags] = useState(["errands", "home", "work"])
  const [submitted, setSubmitted] = useState<CaptureResult | null>(null)

  const form = useAppForm({
    defaultValues: { title: "" },
    validators: {
      // The raw text is never empty for "#errands" alone, so validate what is left of it.
      onSubmit: ({ value }) =>
        extractCapture(value.title, parser).value
          ? undefined
          : { fields: { title: "Add a title as well as tags" } },
    },
    onSubmit: ({ value }) => {
      setSubmitted(extractCapture(value.title, parser))
      form.reset()
    },
  })

  return (
    <div className="max-w-3xl mx-auto flex flex-col min-h-svh px-4 py-8 gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Capture Input</h1>
        <p className="text-muted-foreground">
          Type <code>#tag</code>, <code>@project</code> or <code>!priority</code> inside the title.
          Suggestions appear while you type; the title comes back without them.
        </p>
      </header>

      <main className="flex flex-col gap-6">
        <form.Form
          onSubmit={(event) => {
            event.preventDefault()
            form.handleSubmit()
          }}
        >
          <form.AppField name="title">
            {(field) => (
              <FormFieldLayout
                label="To-do"
                description="Try: Buy milk #errands @Website !high"
                isValidating={field.getMeta().isValidating}
              >
                <field.Capture
                  placeholder="What are we going to do?"
                  autoFocus
                  parser={parser}
                  tokenClassNames={{
                    tag: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
                    project: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
                    priority: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
                  }}
                  sources={{
                    tag: captureSource({
                      items: tags,
                      getLabel: (tag) => tag,
                      // Offers a "Create" row for unknown tags; the text stays either way.
                      onCreate: (name) => {
                        setTags((current) => [...current, name])
                      },
                    }),
                    project: captureSource({
                      items: PROJECTS,
                      getLabel: (project) => project,
                      // No onCreate: only existing projects are suggested.
                    }),
                    priority: captureSource({
                      items: PRIORITIES,
                      getLabel: (priority) => priority,
                    }),
                  }}
                />
              </FormFieldLayout>
            )}
          </form.AppField>
          <form.AppForm>
            <form.Submit label="Add to-do" />
          </form.AppForm>
        </form.Form>

        {submitted && (
          <section className="rounded-lg border p-4 flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Last submitted</h2>
              <Button variant="ghost" size="sm" onClick={() => setSubmitted(null)}>
                Clear
              </Button>
            </div>
            <dl className="grid grid-cols-[6rem_1fr] gap-x-4 gap-y-2">
              <dt className="text-muted-foreground">Raw</dt>
              <dd className="font-mono">{submitted.raw}</dd>
              <dt className="text-muted-foreground">Title</dt>
              <dd className="font-mono">{submitted.value}</dd>
              <dt className="text-muted-foreground">Tokens</dt>
              <dd className="font-mono">{JSON.stringify(groupTokenValues(submitted.tokens))}</dd>
            </dl>
          </section>
        )}
      </main>
    </div>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

const demos = [
  { href: "/store-slice", label: "Store Slice" },
  { href: "/dynamic-dialog", label: "Dynamic Dialog" },
  { href: "/react-query-factory", label: "React Query Factory" },
  { href: "/mark-searched-phrase", label: "Mark Searched Phrase" },
  { href: "/permission-guard", label: "Permission Guard" },
  { href: "/tanstack-form-components", label: "TanStack Form Components" },
]

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col min-h-svh px-4 py-8 gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Custom Registry</h1>
        <p className="text-muted-foreground">
          A custom registry for distributing code using shadcn.
        </p>
      </header>
      <main className="flex flex-col flex-1 gap-3">
        {demos.map((demo) => (
          <Button key={demo.href} asChild variant="outline" className="justify-start">
            <Link href={demo.href}>{demo.label}</Link>
          </Button>
        ))}
      </main>
    </div>
  )
}

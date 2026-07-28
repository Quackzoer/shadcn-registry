import Link from "next/link"

import { demos } from "./demos"

export default function Home() {
  return (
    <div className="mx-auto flex min-h-svh max-w-3xl flex-col gap-8 px-4 py-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Custom Registry</h1>
        <p className="text-muted-foreground">
          A custom registry for distributing code using shadcn.
        </p>
      </header>

      <main className="flex flex-1 flex-col gap-2">
        {demos.map((demo) => (
          <Link
            key={demo.href}
            href={demo.href}
            className="hover:bg-accent flex flex-col gap-0.5 rounded-md border px-4 py-3 transition-colors"
          >
            <span className="font-medium">{demo.label}</span>
            <span className="text-muted-foreground text-sm">
              {demo.description}
            </span>
          </Link>
        ))}
      </main>
    </div>
  )
}

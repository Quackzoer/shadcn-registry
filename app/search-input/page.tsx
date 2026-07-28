'use client'

import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { SearchInput } from '@/registry/search-input/components/search-input'

interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
}

const USERS: User[] = [
  { id: 1, name: 'Ada Lovelace', email: 'ada@example.com', role: 'admin' },
  { id: 2, name: 'Grace Hopper', email: 'grace@example.com', role: 'admin' },
  { id: 3, name: 'Alan Turing', email: 'alan@example.com', role: 'editor' },
  { id: 4, name: 'Katherine Johnson', email: 'kj@example.com', role: 'editor' },
  { id: 5, name: 'Barbara Liskov', email: 'barbara@example.com', role: 'viewer' },
  { id: 6, name: 'Margaret Hamilton', email: 'margaret@example.com', role: 'viewer' },
  { id: 7, name: 'Donald Knuth', email: 'don@example.com', role: 'viewer' },
]

const matches = (user: User, q: string) => {
  const needle = q.toLowerCase()
  return (
    user.name.toLowerCase().includes(needle) ||
    user.email.toLowerCase().includes(needle) ||
    user.role.includes(needle)
  )
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export default function Page() {
  return (
    <div className="mx-auto flex min-h-svh max-w-3xl flex-col gap-8 px-4 py-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Search Input</h1>
        <p className="text-muted-foreground">
          Debounced search over any list. You supply the matching function; it
          owns the query, the debounce, and the result count.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Local filtering</CardTitle>
          <CardDescription>
            Matches across name, email and role. Press{' '}
            <kbd className="text-xs">⌘K</kbd> to focus, Escape to clear, Enter
            to skip the remaining debounce.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SearchInput
            items={USERS}
            filter={(items, q) => items.filter((u) => matches(u, q))}
            placeholder="Search users..."
          >
            {({ results, hasQuery, count }) => (
              <div className="flex flex-col gap-1">
                {hasQuery && count === 0 ? (
                  <p className="text-muted-foreground py-6 text-center text-sm">
                    Nothing matched.
                  </p>
                ) : (
                  results.map((u) => <UserRow key={u.id} user={u} />)
                )}
              </div>
            )}
          </SearchInput>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Async filtering</CardTitle>
          <CardDescription>
            The filter returns a promise, so this works against a server. Stale
            responses are discarded — a slow request can never overwrite a newer
            one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SearchInput
            items={USERS}
            debounceMs={400}
            filter={async (items, q) => {
              // Deliberately variable latency, to make the race visible.
              await delay(300 + Math.random() * 700)
              return items.filter((u) => matches(u, q))
            }}
            placeholder="Search (simulated network)..."
          >
            {({ results, isSearching }) => (
              <div
                className={
                  isSearching ? 'flex flex-col gap-1 opacity-50' : 'flex flex-col gap-1'
                }
              >
                {results.map((u) => (
                  <UserRow key={u.id} user={u} />
                ))}
              </div>
            )}
          </SearchInput>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Minimum length &amp; custom count</CardTitle>
          <CardDescription>
            Below <code>minLength</code> nothing is filtered and no count shows,
            so a single stray keystroke doesn&apos;t churn the list.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SearchInput
            items={USERS}
            minLength={3}
            filter={(items, q) => items.filter((u) => matches(u, q))}
            formatCount={(count) => `${count} of ${USERS.length}`}
            placeholder="Type at least 3 characters..."
          >
            {({ results }) => (
              <div className="flex flex-col gap-1">
                {results.map((u) => (
                  <UserRow key={u.id} user={u} />
                ))}
              </div>
            )}
          </SearchInput>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Controlled</CardTitle>
          <CardDescription>
            Pass <code>value</code> and <code>onValueChange</code> to own the
            query — for URL sync, or to drive it from elsewhere.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ControlledExample />
        </CardContent>
      </Card>
    </div>
  )
}

function ControlledExample() {
  const [value, setValue] = useState('admin')

  return (
    <div className="flex flex-col gap-3">
      <SearchInput
        items={USERS}
        value={value}
        onValueChange={setValue}
        filter={(items, q) => items.filter((u) => matches(u, q))}
        shortcut={false}
      >
        {({ results }) => (
          <div className="flex flex-col gap-1">
            {results.map((u) => (
              <UserRow key={u.id} user={u} />
            ))}
          </div>
        )}
      </SearchInput>
      <p className="text-muted-foreground text-xs">
        Parent state: <code>{value || '(empty)'}</code>
      </p>
    </div>
  )
}

function UserRow({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
      <span className="font-medium">{user.name}</span>
      <span className="text-muted-foreground">{user.email}</span>
      <Badge variant="outline" className="ml-auto">
        {user.role}
      </Badge>
    </div>
  )
}

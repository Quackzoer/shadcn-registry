"use client"

import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  QueryBuilder,
} from "@/registry/query-builder/components/query-builder"
import {
  type QueryBuilderProps,
  type QueryCondition,
  type QueryFieldSchema,
  DEFAULT_OPERATORS,
} from "@/registry/query-builder/types/query-builder"
import {
  toQueryString,
} from "@/registry/query-builder/lib/parse-query"
import {
  resolveQuery,
} from "@/registry/query-builder/hooks/use-query-filter"

// ---------------------------------------------------------------------------
// Schema — extensible operators per field
// ---------------------------------------------------------------------------

const SCHEMA = [
  {
    name: "name",
    label: "Name",
    type: "string",
    operators: DEFAULT_OPERATORS.string,
  },
  {
    name: "email",
    label: "Email",
    type: "string",
    operators: DEFAULT_OPERATORS.string,
  },
  {
    name: "age",
    label: "Age",
    type: "number",
    operators: DEFAULT_OPERATORS.number,
  },
  {
    name: "role",
    label: "Role",
    type: "string",
    operators: ["eq", "neq"],
    options: ["admin", "editor", "viewer"],
  },
  {
    name: "status",
    label: "Status",
    type: "string",
    operators: ["eq", "neq"],
    options: ["active", "inactive", "suspended"],
  },
  {
    name: "department",
    label: "Department",
    type: "string",
    operators: ["eq", "neq", "in", "not_in"],
    options: ["engineering", "design", "marketing", "sales"],
  },
] as const satisfies readonly QueryFieldSchema[]

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

interface User {
  id: number
  name: string
  email: string
  age: number
  role: "admin" | "editor" | "viewer"
  status: "active" | "inactive" | "suspended"
  department: string
}

const USERS: User[] = [
  { id: 1, name: "Ada Lovelace", email: "ada@example.com", age: 36, role: "admin", status: "active", department: "engineering" },
  { id: 2, name: "Grace Hopper", email: "grace@example.com", age: 85, role: "admin", status: "active", department: "engineering" },
  { id: 3, name: "Alan Turing", email: "alan@example.com", age: 41, role: "editor", status: "active", department: "design" },
  { id: 4, name: "Katherine Johnson", email: "kj@example.com", age: 101, role: "editor", status: "inactive", department: "engineering" },
  { id: 5, name: "Barbara Liskov", email: "barbara@example.com", age: 85, role: "viewer", status: "active", department: "marketing" },
  { id: 6, name: "Margaret Hamilton", email: "margaret@example.com", age: 88, role: "viewer", status: "active", department: "engineering" },
  { id: 7, name: "Donald Knuth", email: "don@example.com", age: 87, role: "viewer", status: "suspended", department: "sales" },
  { id: 8, name: "Linus Torvalds", email: "linus@example.com", age: 55, role: "editor", status: "active", department: "engineering" },
  { id: 9, name: "Guido van Rossum", email: "guido@example.com", age: 68, role: "viewer", status: "inactive", department: "design" },
  { id: 10, name: "Bjarne Stroustrup", email: "bjarne@example.com", age: 74, role: "editor", status: "active", department: "marketing" },
]

// ---------------------------------------------------------------------------
// Resolver — single function handles every operator
// ---------------------------------------------------------------------------

const resolver: QueryBuilderProps<User>["resolver"] = (field, operator, value) => {
  return (user) => {
    const fieldValue = user[field as keyof User]
    const numValue = typeof fieldValue === "number" ? fieldValue : Number(value)
    const strValue = String(fieldValue ?? "").toLowerCase()
    const cmpValue = (value ?? "").toLowerCase()

    switch (operator) {
      case "eq":
        return strValue === cmpValue || (typeof fieldValue === "number" && numValue === Number(value))
      case "neq":
        return strValue !== cmpValue && !(typeof fieldValue === "number" && numValue === Number(value))
      case "gt":
        return typeof fieldValue === "number" && numValue > Number(value)
      case "gte":
        return typeof fieldValue === "number" && numValue >= Number(value)
      case "lt":
        return typeof fieldValue === "number" && numValue < Number(value)
      case "lte":
        return typeof fieldValue === "number" && numValue <= Number(value)
      case "contains":
        return strValue.includes(cmpValue)
      case "starts_with":
        return strValue.startsWith(cmpValue)
      case "ends_with":
        return strValue.endsWith(cmpValue)
      case "in":
        return (value ?? "").split(",").map((s) => s.trim().toLowerCase()).includes(strValue)
      case "not_in":
        return !(value ?? "").split(",").map((s) => s.trim().toLowerCase()).includes(strValue)
      case "is_null":
        return fieldValue == null
      case "is_not_null":
        return fieldValue != null
      default:
        return true
    }
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function Page() {
  return (
    <div className="mx-auto flex min-h-svh max-w-3xl flex-col gap-8 px-4 py-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Query Builder</h1>
        <p className="text-muted-foreground">
          Chip-based filter input with inline autocomplete. Type a field name,
          comma, operator, comma, and value — each part renders as a colored
          segment. Results filter live as you type.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Child render prop</CardTitle>
          <CardDescription>
            Use <code>children</code> as a render function to compose your own
            layout. The child receives <code>entity</code>, <code>operator</code>,
            and <code>value</code> helpers, plus <code>getFilteredData()</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QueryBuilder
            schema={SCHEMA}
            resolver={resolver}
            data={USERS}
            placeholder="field, operator, value..."
          >
            {({ getFilteredData, conditions }) => {
              const results = getFilteredData()
              return (
                <div className="flex flex-col gap-3">
                  {conditions.length > 0 && (
                    <div className="text-muted-foreground flex items-center gap-2 text-xs">
                      <span>Query:</span>
                      <code className="bg-muted rounded px-1.5 py-0.5 font-mono">
                        {toQueryString(conditions)}
                      </code>
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    <p className="text-muted-foreground mb-1 text-xs">
                      {results.length} of {USERS.length} users
                    </p>
                    {results.length === 0 ? (
                      <p className="text-muted-foreground py-6 text-center text-sm">
                        No users match the current filters.
                      </p>
                    ) : (
                      results.map((u) => (
                        <div
                          key={u.id}
                          className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                        >
                          <span className="font-medium">{u.name}</span>
                          <span className="text-muted-foreground">{u.email}</span>
                          <span className="text-muted-foreground">{u.age}</span>
                          <Badge variant="outline" className="ml-auto">
                            {u.role}
                          </Badge>
                          <Badge
                            variant={
                              u.status === "active"
                                ? "default"
                                : u.status === "suspended"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {u.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            }}
          </QueryBuilder>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Styling callbacks</CardTitle>
          <CardDescription>
            Pass <code>entityChipClassName</code>, <code>operatorChipClassName</code>,
            or <code>valueChipClassName</code> as functions to dynamically style
            each chip part.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StylingExample />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Server-side resolveQuery</CardTitle>
          <CardDescription>
            Use <code>resolveQuery()</code> on the server with the same resolver.
            No hooks required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ServerExample />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Programmatic preset</CardTitle>
          <CardDescription>
            Pre-populate conditions from code. Works in both controlled and
            uncontrolled modes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PresetExample />
        </CardContent>
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Styling example
// ---------------------------------------------------------------------------

function StylingExample() {
  const [conditions, setConditions] = useState<QueryCondition[]>([])

  return (
    <div className="flex flex-col gap-3">
      <QueryBuilder
        schema={SCHEMA}
        conditions={conditions}
        onConditionsChange={setConditions}
        resolver={resolver}
        data={USERS}
        entityChipClassName={({ field }) =>
          field === "role"
            ? "flex items-center rounded-l-md bg-amber-500/15 px-2 py-0.5 text-amber-700 dark:text-amber-400"
            : "flex items-center rounded-l-md bg-blue-500/15 px-2 py-0.5 text-blue-700 dark:text-blue-400"
        }
        operatorChipClassName={({ operator }) =>
          operator === "eq"
            ? "flex items-center bg-emerald-500/15 px-1.5 py-0.5 text-emerald-700 dark:text-emerald-400"
            : "flex items-center bg-purple-500/15 px-1.5 py-0.5 text-purple-700 dark:text-purple-400"
        }
      />

      {conditions.length > 0 && (
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <span>Query:</span>
          <code className="bg-muted rounded px-1.5 py-0.5 font-mono">
            {toQueryString(conditions)}
          </code>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Server example — uses resolveQuery (no hooks)
// ---------------------------------------------------------------------------

function ServerExample() {
  const conditions: QueryCondition[] = [
    { field: "role", operator: "eq", value: "admin" },
    { field: "status", operator: "eq", value: "active" },
  ]

  const results = resolveQuery(conditions, SCHEMA, resolver, USERS)

  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted-foreground text-xs">
        This calls <code>resolveQuery()</code> directly — no hooks, no state.
        Ideal for server components or API routes.
      </p>
      <code className="bg-muted text-muted-foreground rounded px-2 py-1 text-xs">
        resolveQuery(conditions, schema, resolver, USERS)
      </code>
      <div className="text-muted-foreground flex items-center gap-2 text-xs">
        <span>Conditions:</span>
        <code className="bg-muted rounded px-1.5 py-0.5 font-mono">
          {toQueryString(conditions)}
        </code>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-muted-foreground mb-1 text-xs">
          {results.length} of {USERS.length} users
        </p>
        {results.map((u) => (
          <div
            key={u.id}
            className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
          >
            <span className="font-medium">{u.name}</span>
            <span className="text-muted-foreground">{u.email}</span>
            <Badge variant="outline" className="ml-auto">
              {u.role}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Preset example
// ---------------------------------------------------------------------------

function PresetExample() {
  const [conditions, setConditions] = useState<QueryCondition[]>([
    { field: "role", operator: "eq", value: "admin" },
    { field: "status", operator: "eq", value: "active" },
  ])

  const results = resolveQuery(conditions, SCHEMA, resolver, USERS)

  return (
    <div className="flex flex-col gap-3">
      <QueryBuilder
        schema={SCHEMA}
        conditions={conditions}
        onConditionsChange={setConditions}
        resolver={resolver}
        data={USERS}
        placeholder="Add filter..."
      />

      {conditions.length > 0 && (
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <span>Query:</span>
          <code className="bg-muted rounded px-1.5 py-0.5 font-mono">
            {toQueryString(conditions)}
          </code>
        </div>
      )}

      <div className="flex flex-col gap-1">
        {results.map((u) => (
          <div
            key={u.id}
            className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
          >
            <span className="font-medium">{u.name}</span>
            <span className="text-muted-foreground">{u.email}</span>
            <Badge variant="outline" className="ml-auto">
              {u.role}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}

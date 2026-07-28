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
  type QueryCondition,
  type QueryFieldSchema,
  OPERATOR_LABELS,
} from "@/registry/query-builder/types/query-builder"
import { toQueryString } from "@/registry/query-builder/lib/parse-query"

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const SCHEMA = [
  {
    name: "name",
    label: "Name",
    type: "string",
  },
  {
    name: "email",
    label: "Email",
    type: "string",
  },
  {
    name: "age",
    label: "Age",
    type: "number",
  },
  {
    name: "role",
    label: "Role",
    type: "string",
    options: ["admin", "editor", "viewer"],
  },
  {
    name: "status",
    label: "Status",
    type: "string",
    options: ["active", "inactive", "suspended"],
  },
  {
    name: "department",
    label: "Department",
    type: "string",
    options: ["engineering", "design", "marketing", "sales"],
  },
] as const satisfies readonly QueryFieldSchema[];

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  role: "admin" | "editor" | "viewer";
  status: "active" | "inactive" | "suspended";
  department: string;
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
];

// ---------------------------------------------------------------------------
// Filter logic
// ---------------------------------------------------------------------------

function matchesCondition(user: User, condition: QueryCondition): boolean {
  const fieldValue = user[condition.field as keyof User];
  const { operator, value } = condition;

  const numValue = typeof fieldValue === "number" ? fieldValue : Number(value);
  const strValue = String(fieldValue ?? "").toLowerCase();
  const cmpValue = (value ?? "").toLowerCase();

  switch (operator) {
    case "eq":
      return strValue === cmpValue || (typeof fieldValue === "number" && numValue === Number(value));
    case "neq":
      return strValue !== cmpValue && !(typeof fieldValue === "number" && numValue === Number(value));
    case "gt":
      return typeof fieldValue === "number" && numValue > Number(value);
    case "gte":
      return typeof fieldValue === "number" && numValue >= Number(value);
    case "lt":
      return typeof fieldValue === "number" && numValue < Number(value);
    case "lte":
      return typeof fieldValue === "number" && numValue <= Number(value);
    case "contains":
      return strValue.includes(cmpValue);
    case "starts_with":
      return strValue.startsWith(cmpValue);
    case "ends_with":
      return strValue.endsWith(cmpValue);
    case "in":
      return (value ?? "").split(",").map((s) => s.trim().toLowerCase()).includes(strValue);
    case "not_in":
      return !(value ?? "").split(",").map((s) => s.trim().toLowerCase()).includes(strValue);
    case "is_null":
      return fieldValue == null;
    case "is_not_null":
      return fieldValue != null;
    default:
      return true;
  }
}

function filterUsers(users: User[], conditions: QueryCondition[]): User[] {
  if (conditions.length === 0) return users;
  return users.filter((u) => conditions.every((c) => matchesCondition(u, c)));
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function Page() {
  const [conditions, setConditions] = useState<QueryCondition[]>([]);
  const results = filterUsers(USERS, conditions);

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
          <CardTitle>Live filtering</CardTitle>
          <CardDescription>
            Type <code>field,operator,value</code> — commas advance between
            parts. The dropdown autocompletes each part as you type. Backspace
            on empty input removes the last condition.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <QueryBuilder
            schema={SCHEMA}
            conditions={conditions}
            onConditionsChange={setConditions}
            placeholder="field, operator, value..."
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
        <CardContent className="flex flex-col gap-4">
          <PresetExample />
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Preset example
// ---------------------------------------------------------------------------

function PresetExample() {
  const [conditions, setConditions] = useState<QueryCondition[]>([
    { field: "role", operator: "eq", value: "admin" },
    { field: "status", operator: "eq", value: "active" },
  ]);

  const results = filterUsers(USERS, conditions);

  return (
    <div className="flex flex-col gap-4">
      <QueryBuilder
        schema={SCHEMA}
        conditions={conditions}
        onConditionsChange={setConditions}
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
  );
}

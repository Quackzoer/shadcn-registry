"use client"

import * as React from "react"

import type {
  QueryCondition,
  QueryFieldSchema,
  QueryResolver,
  UseQueryFilterProps,
  UseQueryFilterReturn,
} from "@/registry/query-builder/types/query-builder"

// ---------------------------------------------------------------------------
// Client-side hook
// ---------------------------------------------------------------------------

export function useQueryFilter<TData>({
  conditions,
  schema: _schema,
  resolver,
  data,
}: UseQueryFilterProps<TData>): UseQueryFilterReturn<TData> {
  const filtered = React.useMemo(() => {
    if (conditions.length === 0) return [...data]

    return data.filter((item) =>
      conditions.every((c) => resolver(c.field, c.operator, c.value)(item)),
    )
  }, [conditions, data, resolver])

  return { filtered, count: filtered.length }
}

// ---------------------------------------------------------------------------
// Server-side helper — no hooks, pure function
// ---------------------------------------------------------------------------

export function resolveQuery<TData>(
  conditions: QueryCondition[],
  schema: readonly QueryFieldSchema[],
  resolver: QueryResolver<TData>,
  data: readonly TData[],
): TData[] {
  if (conditions.length === 0) return [...data]

  return data.filter((item) =>
    conditions.every((c) => resolver(c.field, c.operator, c.value)(item)),
  )
}

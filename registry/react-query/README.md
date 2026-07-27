# react-query

Two factories for building typed `useQuery` hooks, plus the query-key-factory
convention they're designed around.

```bash
npx shadcn@latest add https://shadcn.krzysztof.kazor.com/r/react-query.json
```

## Which factory to use

Both ship. They are different generations of the same idea, and the newer one
is the recommended default.

### `createQueryHook` — recommended

The builder receives `(options, params)` and returns the whole query config, so
**it** decides how caller options merge with defaults rather than the factory
imposing an order.

```ts
export const projectQuery = {
  useById: createQueryHook((options, { projectId }: { projectId?: string }) => ({
    ...queryKeys.project.details({ projectId: projectId! }),
    ...options,
    enabled: !!projectId && (options.enabled ?? true),
  })),
}
```

That `enabled` line is the reason this shape exists: the hook has its own
precondition (`projectId` must be set) *and* the caller may want to disable the
query for their own reasons. Because the builder owns the merge, both compose.
With a factory that merges for you, one silently wins.

`TQueryFnData` and `TKey` are inferred from the returned `queryKey`/`queryFn`,
so spreading a `@lukemorales/query-key-factory` entry types the whole hook, and
`select` narrows `TData` at the call site:

```ts
const { data } = projectQuery.useById({ params: { projectId } })
//      ^? Project
const { data } = projectQuery.useById({ params: { projectId }, select: p => p.name })
//      ^? string
```

### `createUseQuery` — the earlier form

Takes a `queryFn` plus default options and concatenates query keys. Simpler for
hooks with no conditional `enabled` and no key factory:

```ts
export const useProjects = createUseQuery(fetchProjects, { queryKey: ['projects'] })
```

Kept because existing installs depend on it. For new hooks, prefer
`createQueryHook`.

## Query key convention

Both are designed to pair with `@lukemorales/query-key-factory`. The rule that
makes it work: **keys hold no logic**. A key entry only names a query and
points at the function that runs it —

```ts
const projectKeys = createQueryKeys('project', {
  details: (props: GetProjectProps) => ({
    queryKey: [props.projectId],
    queryFn: () => getProjectById(props),   // just a call
  }),
})
```

— and every branch, guard, and transform lives in `getProjectById`. Keys stay
readable as an index of what the app fetches, and query functions stay testable
without React.

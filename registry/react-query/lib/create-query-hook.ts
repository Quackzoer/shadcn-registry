import { useQuery } from '@tanstack/react-query'
import type { QueryFunction, QueryKey, UseQueryOptions } from '@tanstack/react-query'

/**
 * Inside the builder, options use `any` generics so they don't block inference
 * of TQueryFnData and TKey from the builder's return value. The call site
 * (HookOptions) stays fully typed.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BuilderOptions = Omit<UseQueryOptions<any, any, any, any>, 'queryKey' | 'queryFn'>

type HookOptions<TQueryFnData, TData, TKey extends QueryKey, TParams> = {
  params: TParams
} & Omit<UseQueryOptions<TQueryFnData, Error, TData, TKey>, 'queryKey' | 'queryFn'>

/**
 * Creates a typed `useQuery` wrapper hook.
 *
 * The builder receives `(options, params)` and returns the final query config,
 * so it — not the factory — decides how caller options merge with defaults.
 * That is what makes `enabled` composable:
 *
 * ```ts
 * export const projectQuery = {
 *   useById: createQueryHook((options, { projectId }: { projectId?: string }) => ({
 *     ...queryKeys.project.details({ projectId: projectId! }),
 *     ...options,
 *     enabled: !!projectId && (options.enabled ?? true),
 *   })),
 * }
 * ```
 *
 * `TQueryFnData` and `TKey` are inferred from the returned `queryKey`/`queryFn`,
 * so spreading a `@lukemorales/query-key-factory` entry types the whole hook.
 *
 * `select` narrows `TData` at the call site with no extra annotation:
 *
 * ```ts
 * const { data } = projectQuery.useById({ params: { projectId } })
 * //      ^? Project
 * const { data } = projectQuery.useById({ params: { projectId }, select: p => p.name })
 * //      ^? string
 * ```
 */
export function createQueryHook<TParams, TQueryFnData, TKey extends QueryKey>(
  buildQuery: (
    options: BuilderOptions,
    params: TParams
  ) => { queryKey: TKey; queryFn: QueryFunction<TQueryFnData, TKey> } & BuilderOptions
) {
  return <TData = TQueryFnData>({
    params,
    ...options
  }: HookOptions<TQueryFnData, TData, TKey, TParams>) =>
    useQuery<TQueryFnData, Error, TData, TKey>(
      buildQuery(options as BuilderOptions, params) as UseQueryOptions<
        TQueryFnData,
        Error,
        TData,
        TKey
      >
    )
}

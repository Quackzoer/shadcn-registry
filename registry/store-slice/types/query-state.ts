/**
 * Query state types — derived from TanStack Query, never re-declared.
 *
 * Everything here is a `Pick` (or a rename) of the library's own
 * `UseQueryResult`, so the store's vocabulary cannot drift from TanStack's.
 * Two consequences worth knowing:
 *
 *  - A real `useQuery(...)` result is assignable to `QuerySnapshot` as-is.
 *    `syncQuery(useGetCrmById(id))` type-checks with no adapter.
 *  - Semantic changes in the library (v5 redefined `isLoading` and added
 *    `isPending`) surface as type errors instead of silently meaning
 *    something new.
 */

import type { UseQueryResult } from '@tanstack/react-query';

/**
 * The `UseQueryResult` fields the store mirrors.
 *
 * This union is the single source of truth: state keys, setter names, and the
 * runtime copy loop all derive from it. Add a field here (and to
 * `MIRRORED_QUERY_FIELDS` beside it) and every entity in the app grows the
 * matching state key and setter.
 */
export type MirroredQueryField =
  | 'data'
  | 'error'
  | 'isPending'
  | 'isLoading'
  | 'isFetching'
  | 'isError'
  | 'isSuccess';

/**
 * A point-in-time snapshot of a query, typed exactly as TanStack types it
 * (`data: TData | undefined`, `error: TError | null`, flags `boolean`).
 *
 * This is both the sync-input type and the stored-state type — there is no
 * separate "normalized" shape to remember.
 */
export type QuerySnapshot<TData, TError = Error> = Pick<
  UseQueryResult<TData, TError>,
  MirroredQueryField
>;

/**
 * The list flavour of `QuerySnapshot`.
 *
 * The keys are renamed rather than reused (`list` / `isListLoading` instead of
 * `data` / `isLoading`) for a specific reason: an entity slice and a list
 * slice for the SAME entity both live on the flat store, so a collection's
 * loading state and the main entity's loading state have to be two
 * independently observable facts.
 */
export type ListQuerySnapshot<TItem, TError = Error> = {
  list: TItem[] | undefined;
  listError: TError | null;
  isListPending: boolean;
  isListLoading: boolean;
  isListFetching: boolean;
  isListError: boolean;
  isListSuccess: boolean;
};

/** Identifier type accepted by the list slice's by-id operations. */
export type EntityId = string | number;

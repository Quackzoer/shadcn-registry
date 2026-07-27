'use client';

/**
 * The React glue. Replaces the hand-written mirroring effect:
 *
 * ```ts
 * // before — mirrors data only; loading and error never reach the store
 * const { setCrmData } = useAppStore(s => s.crmActions);
 * const { data } = useGetCrmById(id);
 * useEffect(() => { setCrmData(data ?? null); }, [data, setCrmData]);
 *
 * // after — every mirrored field, one line
 * useSyncQuery(useGetCrmById(id), useAppStore(s => s.crmSetters.syncQuery));
 * ```
 */

import { useEffect } from 'react';
import type { QuerySnapshot } from '../types/query-state';

/**
 * Mirrors a TanStack query into a store slice.
 *
 * Works for both entity (`syncQuery`) and list (`syncListQuery`) setters — the
 * hook only requires that the callback accepts the snapshot.
 */
export const useSyncQuery = <TData, TError = Error>(
  query: QuerySnapshot<TData, TError>,
  sync: (query: QuerySnapshot<TData, TError>) => void
): void => {
  useEffect(() => {
    sync(query);
    // Depends on the individual fields, not the result object: TanStack
    // returns a new object every render, so `[query]` would fire the effect
    // every render. The fields themselves are referentially stable, and
    // `sync` is stable because the setters object is created once with the
    // slice.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    sync,
    query.data,
    query.error,
    query.isPending,
    query.isLoading,
    query.isFetching,
    query.isError,
    query.isSuccess,
  ]);
};

/**
 * Syncs, and clears the slice on unmount so a layout leaves no stale entity
 * behind when the user navigates away.
 *
 * Opt-in rather than the default, because "keep showing the last entity while
 * the next one loads" is sometimes the behaviour you want.
 */
export const useSyncQueryWithCleanup = <TData, TError = Error>(
  query: QuerySnapshot<TData, TError>,
  sync: (query: QuerySnapshot<TData, TError>) => void,
  reset: () => void
): void => {
  useSyncQuery(query, sync);
  useEffect(() => reset, [reset]);
};

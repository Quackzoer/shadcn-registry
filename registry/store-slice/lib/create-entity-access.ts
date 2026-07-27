/**
 * `createEntityAccess` — optional sugar over raw selectors.
 *
 * Raw selectors already work (`useAppStore(s => s.crm_data)`), but every call
 * site repeats the prefix. This binds a store hook to one slice name once:
 *
 * ```ts
 * export const crm = createEntityAccess<CrmMeta>()(useAppStore, 'crm');
 *
 * crm.useData()      // CrmMeta | undefined
 * crm.useIsLoading() // boolean — the undefined "never observed" case coalesced
 * crm.useSetters()   // EntitySetters<CrmMeta>
 * crm.get()          // outside React
 * ```
 *
 * This generalizes the common "one hand-written typed hook per entity"
 * pattern into a single factory.
 */

import type { EntitySetters } from '../types/slice';
import type { MirroredQueryField } from '../types/query-state';

/** Structural shape of a zustand hook (`UseBoundStore<StoreApi<T>>`). */
export interface StoreHookLike<TStore> {
  <TReturn>(selector: (state: TStore) => TReturn): TReturn;
  getState: () => TStore;
}

/** The status half of a mirrored query, without `data`. */
export interface EntityStatus<TError = Error> {
  error: TError | null | undefined;
  isPending: boolean | undefined;
  isLoading: boolean | undefined;
  isFetching: boolean | undefined;
  isError: boolean | undefined;
  isSuccess: boolean | undefined;
}

export const createEntityAccess =
  <TData, TError = Error>() =>
  <TStore, TName extends string>(
    useStore: StoreHookLike<TStore>,
    name: TName
  ) => {
    const key = (field: MirroredQueryField) => `${name}_${field}`;
    const read = <T>(state: TStore, field: string) =>
      (state as Record<string, unknown>)[field] as T;
    const setters = (state: TStore) =>
      read<EntitySetters<TData, TError>>(state, `${name}Setters`);

    return {
      /** The mirrored entity, or `undefined` before the first sync. */
      useData: () => useStore((s) => read<TData | undefined>(s, key('data'))),
      /**
       * All status flags in one subscription. Builds a fresh object each
       * render — pair with zustand's `useShallow` if that shows up in a
       * profile.
       */
      useStatus: (): EntityStatus<TError> =>
        useStore((s) => ({
          error: read<TError | null | undefined>(s, key('error')),
          isPending: read<boolean | undefined>(s, key('isPending')),
          isLoading: read<boolean | undefined>(s, key('isLoading')),
          isFetching: read<boolean | undefined>(s, key('isFetching')),
          isError: read<boolean | undefined>(s, key('isError')),
          isSuccess: read<boolean | undefined>(s, key('isSuccess')),
        })),
      useIsLoading: () =>
        useStore(
          (s) => read<boolean | undefined>(s, key('isLoading')) ?? false
        ),
      useError: () =>
        useStore(
          (s) => read<TError | null | undefined>(s, key('error')) ?? null
        ),
      /** Stable across renders — safe to use in effect dependency arrays. */
      useSetters: () => useStore(setters),
      /** Just the sync callback, for `useSyncQuery`. */
      useSyncCallback: () => useStore((s) => setters(s).syncQuery),

      // Escape hatches for event handlers, tests, and non-React callers.
      get: () => read<TData | undefined>(useStore.getState(), key('data')),
      set: (data: TData | undefined) =>
        setters(useStore.getState()).setData(data),
      setters: () => setters(useStore.getState()),
    };
  };

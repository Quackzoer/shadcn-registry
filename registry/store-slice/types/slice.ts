/**
 * Slice types — the shape of a generated entity/list slice.
 *
 * Nothing in here is written per entity. Given a name and a data type, these
 * types compute the flat state keys, the setter names, and their signatures.
 * The only thing an author declares by hand is the signatures of their own
 * getters and actions.
 */

import type {
  EntityId,
  ListQuerySnapshot,
  MirroredQueryField,
  QuerySnapshot,
} from './query-state';

// ─────────────────────────────────────────────────────────────────────────────
// Generic helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Flattens an intersection so editor tooltips show the resolved object. */
export type Prettify<T> = {
  [K in keyof T]: T[K];
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
} & {};

/** `{ data: T }` + `'crm_'` → `{ crm_data: T }` */
export type PrefixedKeys<T, P extends string> = {
  [K in keyof T as `${P}${string & K}`]: T[K];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFn = (...args: any[]) => unknown;

/**
 * "Every member of T is a function", as a mapped type over `keyof T` rather
 * than `Record<string, AnyFn>`.
 *
 * This distinction is load-bearing: an `interface` has no implicit index
 * signature, so `interface CrmGetters {...}` is NOT assignable to
 * `Record<string, AnyFn>` while an identical `type` alias is. Used as a
 * self-referential constraint (`TGetters extends FnsOf<TGetters>`) it accepts
 * both, while still rejecting non-function members.
 */
export type FnsOf<T> = { [K in keyof T]: AnyFn };

/** Empty-object default for optional getters/actions generics. */
export type None = Record<never, never>;

/** Minimal structural `set` — compatible with zustand's `StateCreator` set. */
export type SetLike<TStore> = (
  partial: Partial<TStore> | ((state: TStore) => Partial<TStore>)
) => void;

/** Adds `Record<Key, T>` to an intersection only when `T` has members. */
export type WhenNonEmpty<Key extends string, T> = [keyof T] extends [never]
  ? unknown
  : Record<Key, T>;

// ─────────────────────────────────────────────────────────────────────────────
// Entity slice
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Flat, prefixed, OPTIONAL query-state keys: `crm_data`, `crm_isLoading`, …
 *
 * Optional is deliberate. It means a slice implementation needs no
 * initial-state block at all, and — more importantly — it models reality:
 * `crm_isLoading: false` would assert "this query is not loading", which is
 * untrue before the query has ever been observed. `undefined` says exactly
 * that, and stays distinguishable from a real `false`.
 */
export type EntityState<TName extends string, TData, TError = Error> = Partial<
  PrefixedKeys<QuerySnapshot<TData, TError>, `${TName}_`>
>;

/**
 * One `set{Field}` per mirrored query field, mapped from `QuerySnapshot` so
 * the names and value types can never disagree with the state keys.
 */
export type FieldSetters<TData, TError = Error> = {
  [K in MirroredQueryField as `set${Capitalize<K>}`]: (
    value: QuerySnapshot<TData, TError>[K]
  ) => void;
};

export type EntitySetters<TData, TError = Error> = FieldSetters<
  TData,
  TError
> & {
  /**
   * Mirrors a whole `useQuery` result into the store in one `set` call.
   *
   * This is the piece that makes mirroring *all* query state cheaper than
   * mirroring just `data` — which is what stops `isLoading` and `error` from
   * being declared in a slice and then written by nothing.
   */
  syncQuery: (query: QuerySnapshot<TData, TError>) => void;
  /** Shallow-merges a patch into current data. No-op while data is unset. */
  patchData: (patch: Partial<TData>) => void;
  /** Clears every mirrored field back to `undefined`. */
  reset: () => void;
};

export type EntitySlice<
  TName extends string,
  TData,
  TError = Error,
  TGetters extends object = None,
  TActions extends object = None,
> = EntityState<TName, TData, TError> &
  Record<`${TName}Setters`, EntitySetters<TData, TError>> &
  WhenNonEmpty<`${TName}Getters`, TGetters> &
  WhenNonEmpty<`${TName}Actions`, TActions>;

/**
 * Declaration-first alias for composing a store type.
 *
 * ```ts
 * type AppStore =
 *   DefineEntitySlice<'crm', CrmMeta, { getters: CrmGetters }> &
 *   DefineEntitySlice<'survey', SurveyMeta>;
 * ```
 */
export type DefineEntitySlice<
  TName extends string,
  TData,
  TConfig extends {
    error?: unknown;
    getters?: object;
    actions?: object;
  } = None,
> = Prettify<
  EntitySlice<
    TName,
    TData,
    TConfig extends { error: infer E } ? E : Error,
    TConfig extends { getters: infer G extends object } ? G : None,
    TConfig extends { actions: infer A extends object } ? A : None
  >
>;

export interface CreateEntitySliceOptions<
  TStore,
  TData,
  TError,
  TGetters extends object,
  TActions extends object,
> {
  /**
   * Derived reads. `get` returns the WHOLE store, which is the reason getters
   * live on the slice rather than being free-standing selectors.
   */
  getters?: (get: () => TStore) => TGetters;
  /** Custom logic — anything beyond a plain field write. */
  actions?: (set: SetLike<TStore>, get: () => TStore) => TActions;
  /**
   * Override any subset of the generated setters.
   *
   * `defaults` is handed in so an override can decorate rather than
   * reimplement — without it, every override would have to re-do the
   * key-writing it is trying to extend, reintroducing the boilerplate in the
   * highest-risk place.
   */
  setters?: (
    set: SetLike<TStore>,
    get: () => TStore,
    defaults: EntitySetters<TData, TError>
  ) => Partial<EntitySetters<TData, TError>>;
}

// ─────────────────────────────────────────────────────────────────────────────
// List slice
// ─────────────────────────────────────────────────────────────────────────────

export type ListField =
  | 'list'
  | 'listError'
  | 'isListPending'
  | 'isListLoading'
  | 'isListFetching'
  | 'isListError'
  | 'isListSuccess';

/** List query keys plus the current selection, all optional and prefixed. */
export type ListState<
  TName extends string,
  TItem,
  TId extends EntityId = EntityId,
  TError = Error,
> = Partial<
  PrefixedKeys<ListQuerySnapshot<TItem, TError>, `${TName}_`> &
    Record<`${TName}_selectedId`, TId>
>;

export type ListFieldSetters<TItem, TError = Error> = {
  [K in ListField as `set${Capitalize<K>}`]: (
    value: ListQuerySnapshot<TItem, TError>[K]
  ) => void;
};

export type ListSetters<
  TItem,
  TId extends EntityId = EntityId,
  TError = Error,
> = ListFieldSetters<TItem, TError> & {
  /** Mirrors a raw list-returning `useQuery` result in one `set` call. */
  syncListQuery: (query: QuerySnapshot<TItem[], TError>) => void;
  /** Clears every list field, and the selection, back to `undefined`. */
  resetList: () => void;
  /** Marks an entity as selected without disturbing the main `_data` entity. */
  setSelectedId: (id: TId | undefined) => void;
  /** Shallow-merges a patch into the list member with the given id. */
  updateById: (id: TId, patch: Partial<TItem>) => void;
  /** Replaces the member with a matching id, or appends when absent. */
  upsertById: (item: TItem) => void;
  removeById: (id: TId) => void;
};

export type ListGetters<TItem, TId extends EntityId = EntityId> = {
  getById: (id: TId) => TItem | undefined;
  /**
   * The entity addressed by `_selectedId`, resolved against the list on read.
   * Storing a pointer rather than a second copy is what keeps the selection
   * from drifting out of sync with list contents.
   */
  getSelected: () => TItem | undefined;
};

export type ListSlice<
  TName extends string,
  TItem,
  TId extends EntityId = EntityId,
  TError = Error,
> = ListState<TName, TItem, TId, TError> &
  Record<`${TName}ListSetters`, ListSetters<TItem, TId, TError>> &
  Record<`${TName}ListGetters`, ListGetters<TItem, TId>>;

export interface CreateListSliceOptions<
  TStore,
  TItem,
  TId extends EntityId,
  TError,
> {
  /** How to read an item's id. Defaults to `item.id`. */
  selectId?: (item: TItem) => TId;
  /** Override any subset of the generated list setters. */
  setters?: (
    set: SetLike<TStore>,
    get: () => TStore,
    defaults: ListSetters<TItem, TId, TError>
  ) => Partial<ListSetters<TItem, TId, TError>>;
}

/**
 * Runtime counterparts of the query-state types.
 *
 * The `as const satisfies` pairing on each field list is what keeps the
 * runtime arrays and their type unions from drifting apart — remove a field
 * from one and the other fails to compile.
 */

import type {
  ListField,
  PrefixedKeys,
} from '../types/slice';
import type {
  ListQuerySnapshot,
  MirroredQueryField,
  QuerySnapshot,
} from '../types/query-state';

/** Every `UseQueryResult` field mirrored into the store. */
export const MIRRORED_QUERY_FIELDS = [
  'data',
  'error',
  'isPending',
  'isLoading',
  'isFetching',
  'isError',
  'isSuccess',
] as const satisfies readonly MirroredQueryField[];

/** Every list-flavoured field mirrored into the store. */
export const LIST_FIELDS = [
  'list',
  'listError',
  'isListPending',
  'isListLoading',
  'isListFetching',
  'isListError',
  'isListSuccess',
] as const satisfies readonly ListField[];

/**
 * Copies only the mirrored fields out of a raw `useQuery` result, so the store
 * never accidentally captures `refetch` and friends.
 */
export const pickQuerySnapshot = <TData, TError = Error>(
  query: QuerySnapshot<TData, TError>
): QuerySnapshot<TData, TError> => {
  const out: Record<string, unknown> = {};
  for (const field of MIRRORED_QUERY_FIELDS) out[field] = query[field];
  return out as QuerySnapshot<TData, TError>;
};

/** Renames a query snapshot's keys into their list-flavoured counterparts. */
export const pickListQuerySnapshot = <TItem, TError = Error>(
  query: QuerySnapshot<TItem[], TError>
): ListQuerySnapshot<TItem, TError> => ({
  list: query.data,
  listError: query.error,
  isListPending: query.isPending,
  isListLoading: query.isLoading,
  isListFetching: query.isFetching,
  isListError: query.isError,
  isListSuccess: query.isSuccess,
});

/** Runtime counterpart of `PrefixedKeys` — prefixes every key of an object. */
export const prefixKeys = <T extends Record<string, unknown>, P extends string>(
  prefix: P,
  obj: T
): PrefixedKeys<T, `${P}_`> => {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) out[`${prefix}_${key}`] = obj[key];
  return out as PrefixedKeys<T, `${P}_`>;
};

/** Shared by both factories when building `set{Field}` names. */
export const capitalize = <T extends string>(value: T) =>
  (value.charAt(0).toUpperCase() + value.slice(1)) as Capitalize<T>;

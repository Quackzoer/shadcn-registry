/**
 * `createEntitySlice` — generates a whole single-entity zustand slice from a
 * name and a data type.
 *
 * ```ts
 * const createCrmSlice = createEntitySlice<CrmMeta>()<'crm', AppStore>('crm');
 * ```
 *
 * produces `crm_data`, `crm_error`, `crm_isPending`, `crm_isLoading`,
 * `crm_isFetching`, `crm_isError`, `crm_isSuccess` and a `crmSetters` object
 * with a setter per field plus `syncQuery` / `patchData` / `reset`.
 *
 * Three namespaces, each with one job:
 *   `{name}Setters` — generated field writers. Never contains logic you wrote.
 *   `{name}Getters` — your derived reads. Receive `get`, should not write.
 *   `{name}Actions` — your custom logic. Receive `set` and `get`.
 *
 * Splitting them means "is there business logic hiding in here?" is answerable
 * by location rather than by reading every function body.
 */

import type {
  CreateEntitySliceOptions,
  EntitySetters,
  EntitySlice,
  FieldSetters,
  FnsOf,
  None,
  SetLike,
} from '../types/slice';
import {
  capitalize,
  MIRRORED_QUERY_FIELDS,
  pickQuerySnapshot,
  prefixKeys,
} from './query-snapshot';

/**
 * Curried so `TData` (and optionally `TError`) is given explicitly while the
 * name, store and getter/action shapes infer.
 *
 * The returned function is a plain zustand slice creator — `(set, get) => …` —
 * so it spreads straight into `create<AppStore>()((set, get) => ({ ... }))`.
 *
 * Note on `TStore`: a slice whose getters read the whole store needs
 * `AppStore` to type `get`, so `AppStore` must be declared before the creator
 * rather than inferred from it. See the README's "circularity rule".
 */
export const createEntitySlice =
  <TData, TError = Error>() =>
  <
    TName extends string,
    TStore = unknown,
    TGetters extends FnsOf<TGetters> = None,
    TActions extends FnsOf<TActions> = None,
  >(
    name: TName,
    options?: CreateEntitySliceOptions<
      TStore,
      TData,
      TError,
      TGetters,
      TActions
    >
  ) =>
  (
    set: SetLike<TStore>,
    get: () => TStore
  ): EntitySlice<TName, TData, TError, TGetters, TActions> => {
    const key = (field: string) => `${name}_${field}`;
    const write = (partial: Record<string, unknown>) =>
      set(partial as Partial<TStore>);

    const fieldSetters = Object.fromEntries(
      MIRRORED_QUERY_FIELDS.map((field) => [
        `set${capitalize(field)}`,
        (value: unknown) => write({ [key(field)]: value }),
      ])
    ) as FieldSetters<TData, TError>;

    const defaults: EntitySetters<TData, TError> = {
      ...fieldSetters,
      syncQuery: (query) =>
        write(
          prefixKeys(
            name,
            pickQuerySnapshot(query) as unknown as Record<string, unknown>
          )
        ),
      patchData: (patch) => {
        const current = (get() as Record<string, unknown>)[key('data')] as
          | TData
          | undefined;
        // Safe to call before the query resolves — that is what makes this
        // usable for optimistic updates without a guard at the call site.
        if (current == null) return;
        write({ [key('data')]: { ...current, ...patch } });
      },
      reset: () =>
        write(
          Object.fromEntries(
            MIRRORED_QUERY_FIELDS.map((field) => [key(field), undefined])
          )
        ),
    };

    const setters: EntitySetters<TData, TError> = {
      ...defaults,
      ...options?.setters?.(set, get, defaults),
    };

    return {
      [`${name}Setters`]: setters,
      ...(options?.getters ? { [`${name}Getters`]: options.getters(get) } : {}),
      ...(options?.actions
        ? { [`${name}Actions`]: options.actions(set, get) }
        : {}),
    } as EntitySlice<TName, TData, TError, TGetters, TActions>;
  };

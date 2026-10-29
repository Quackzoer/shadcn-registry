/**
 * `createListSlice` — a collection of entities, mirrored from a list-returning
 * query, plus by-id operations and selection.
 *
 * Composes with `createEntitySlice` under the SAME name. The entity slice owns
 * "the one main entity" (`crm_data`); the list slice owns the collection
 * (`crm_list`) and lets you address any member by id without disturbing the
 * main entity. They share a prefix but no key names, so both sit on the flat
 * store together.
 *
 * Opt in per entity: an entity that never needs a collection simply does not
 * compose one, so there is no empty `crm_list` to misread as "loaded, empty".
 */

import type { EntityId } from '../types/query-state';
import type {
  CreateListSliceOptions,
  ListFieldSetters,
  ListGetters,
  ListSetters,
  ListSlice,
  SetLike,
} from '../types/slice';
import { capitalize, LIST_FIELDS, pickListQuerySnapshot } from './query-snapshot';

export const createListSlice =
  <TItem, TId extends EntityId = EntityId, TError = Error>() =>
  <TName extends string, TStore = unknown>(
    name: TName,
    options?: CreateListSliceOptions<TStore, TItem, TId, TError>
  ) =>
  (
    set: SetLike<TStore>,
    get: () => TStore
  ): ListSlice<TName, TItem, TId, TError> => {
    const key = (field: string) => `${name}_${field}`;
    const write = (partial: Record<string, unknown>) =>
      set(partial as Partial<TStore>);
    const selectId =
      options?.selectId ?? ((item: TItem) => (item as { id: TId }).id);

    const readList = () =>
      ((get() as Record<string, unknown>)[key('list')] as TItem[] | undefined) ??
      [];

    const fieldSetters = Object.fromEntries(
      LIST_FIELDS.map((field) => [
        `set${capitalize(field)}`,
        (value: unknown) => write({ [key(field)]: value }),
      ])
    ) as ListFieldSetters<TItem, TError>;

    const defaults: ListSetters<TItem, TId, TError> = {
      ...fieldSetters,
      syncListQuery: (query) => {
        const snapshot = pickListQuerySnapshot(query);
        write(
          Object.fromEntries(
            Object.entries(snapshot).map(([field, value]) => [key(field), value])
          )
        );
      },
      resetList: () =>
        write(
          Object.fromEntries(
            [...LIST_FIELDS, 'selectedId'].map((field) => [
              key(field),
              undefined,
            ])
          )
        ),
      setSelectedId: (id) => write({ [key('selectedId')]: id }),
      updateById: (id, patch) =>
        write({
          [key('list')]: readList().map((item) =>
            selectId(item) === id ? { ...item, ...patch } : item
          ),
        }),
      upsertById: (item) => {
        const list = readList();
        const id = selectId(item);
        const exists = list.some((member) => selectId(member) === id);
        write({
          [key('list')]: exists
            ? list.map((member) => (selectId(member) === id ? item : member))
            : [...list, item],
        });
      },
      removeById: (id) =>
        write({
          [key('list')]: readList().filter((item) => selectId(item) !== id),
        }),
    };

    const setters: ListSetters<TItem, TId, TError> = {
      ...defaults,
      ...options?.setters?.(set, get, defaults),
    };

    const getters: ListGetters<TItem, TId> = {
      getById: (id) => readList().find((item) => selectId(item) === id),
      getSelected: () => {
        const selectedId = (get() as Record<string, unknown>)[
          key('selectedId')
        ] as TId | undefined;
        if (selectedId === undefined) return undefined;
        return readList().find((item) => selectId(item) === selectedId);
      },
    };

    return {
      [`${name}ListSetters`]: setters,
      [`${name}ListGetters`]: getters,
    } as ListSlice<TName, TItem, TId, TError>;
  };

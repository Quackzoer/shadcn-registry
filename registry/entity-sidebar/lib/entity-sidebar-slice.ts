import type {
  EntityId,
  FilterOption,
  SidebarEntity,
  SidebarFilterFn,
  SidebarSortFn,
  SortOption,
} from '../types/entity-sidebar'

/** Minimal structural `set` — compatible with zustand's `StateCreator` set. */
export type SetLike<TStore> = (
  partial: Partial<TStore> | ((state: TStore) => Partial<TStore>)
) => void

export interface SidebarSliceState {
  sidebar_entities_label?: string
  /** What was put in. Never filtered — `getEntities()` derives from this. */
  sidebar_raw_entities?: Array<SidebarEntity>
  sidebar_is_entities_loading: boolean
  sidebar_entities_error?: Error | null
  sidebar_selected_entity_id?: EntityId | null
  sidebar_filter_options: Array<FilterOption>
  sidebar_sort_options: Array<SortOption>
  sidebar_search_query: string
  sidebar_add_button?: React.ReactNode
}

export interface SidebarSliceActions {
  sidebarActions: {
    resetStore: () => void
    clearSort: () => void
    setEntities: <T extends SidebarEntity = SidebarEntity>(
      entities?: Array<T>
    ) => void
    /** Applies search, then every active filter, then every active sort. */
    getEntities: () => Array<SidebarEntity>
    setEntitiesLabel: (label?: string) => void
    setIsEntitiesLoading: (isLoading: boolean) => void
    setEntitiesError: (error?: Error | null) => void
    setSelectedEntityId: (id?: EntityId | null) => void
    setSearchQuery: (query: string) => void
    setFilterOptions: (options: Array<FilterOption>) => void
    updateFilterOption: (key: string, option: Partial<FilterOption>) => void
    getFilterOption: (key: string) => FilterOption | undefined
    setSortOptions: (options: Array<SortOption>) => void
    updateSortOption: (key: string, option: Partial<SortOption>) => void
    getSortOption: (key: string) => SortOption | undefined
    setAddButton: (button: React.ReactNode) => void
  }
}

export type SidebarSlice = SidebarSliceState & SidebarSliceActions

/**
 * A typed view where entity arrays are narrowed to `SidebarEntity<TMeta>`.
 *
 * The store holds entities as `SidebarEntity<unknown>` so one slice can serve
 * every entity type in an app. This casts on the way out, giving a per-screen
 * typed handle:
 *
 * ```ts
 * const useProjectSidebar = <R,>(sel: (s: TypedSidebarSlice<Project>) => R) =>
 *   useAppStore(sel as (s: AppStore) => R)
 * ```
 */
export type TypedSidebarSlice<TMeta> = Omit<
  SidebarSlice,
  | 'sidebar_raw_entities'
  | 'sidebarActions'
  | 'sidebar_filter_options'
  | 'sidebar_sort_options'
> & {
  sidebar_raw_entities?: Array<SidebarEntity<TMeta>>
  sidebar_filter_options: Array<FilterOption<SidebarEntity<TMeta>>>
  sidebar_sort_options: Array<SortOption<SidebarEntity<TMeta>>>
  sidebarActions: Omit<
    SidebarSlice['sidebarActions'],
    | 'setEntities'
    | 'getEntities'
    | 'setFilterOptions'
    | 'updateFilterOption'
    | 'getFilterOption'
    | 'setSortOptions'
    | 'updateSortOption'
    | 'getSortOption'
  > & {
    setEntities: (entities?: Array<SidebarEntity<TMeta>>) => void
    getEntities: () => Array<SidebarEntity<TMeta>>
    setFilterOptions: (
      options: Array<FilterOption<SidebarEntity<TMeta>>>
    ) => void
    updateFilterOption: (
      key: string,
      option: Partial<FilterOption<SidebarEntity<TMeta>>>
    ) => void
    getFilterOption: (
      key: string
    ) => FilterOption<SidebarEntity<TMeta>> | undefined
    setSortOptions: (options: Array<SortOption<SidebarEntity<TMeta>>>) => void
    updateSortOption: (
      key: string,
      option: Partial<SortOption<SidebarEntity<TMeta>>>
    ) => void
    getSortOption: (key: string) => SortOption<SidebarEntity<TMeta>> | undefined
  }
}

// Filters and sorts recurse into subEntities so a nested tree is filtered at
// every level, not just the top.
function applyFiltersRecursively<T extends SidebarEntity>(
  entities: Array<T>,
  filterFns: Array<SidebarFilterFn<T>>
): Array<T> {
  let result = [...entities]
  for (const fn of filterFns) result = fn(result)
  return result.map((entity) =>
    entity.subEntities?.length
      ? {
          ...entity,
          subEntities: applyFiltersRecursively(
            entity.subEntities as Array<T>,
            filterFns
          ),
        }
      : entity
  )
}

function applySortsRecursively<T extends SidebarEntity>(
  entities: Array<T>,
  sortFns: Array<SidebarSortFn<T>>
): Array<T> {
  let result = [...entities]
  for (const fn of sortFns) result = fn(result)
  return result.map((entity) =>
    entity.subEntities?.length
      ? {
          ...entity,
          subEntities: applySortsRecursively(
            entity.subEntities as Array<T>,
            sortFns
          ),
        }
      : entity
  )
}

const initialState = (): SidebarSliceState => ({
  sidebar_entities_label: undefined,
  sidebar_raw_entities: undefined,
  sidebar_is_entities_loading: false,
  sidebar_entities_error: undefined,
  sidebar_selected_entity_id: undefined,
  sidebar_filter_options: [],
  sidebar_sort_options: [],
  sidebar_search_query: '',
  sidebar_add_button: undefined,
})

/**
 * Store-agnostic slice creator — spread it into any zustand store:
 *
 * ```ts
 * const useAppStore = create<AppStore>()((set, get) => ({
 *   ...createSidebarSlice<AppStore>()(set, get),
 * }))
 * ```
 */
export const createSidebarSlice =
  <TStore extends SidebarSlice>() =>
  (set: SetLike<TStore>, get: () => TStore): SidebarSlice => {
    const write = (partial: Partial<SidebarSliceState>) =>
      set(partial as Partial<TStore>)

    return {
      ...initialState(),
      sidebarActions: {
        resetStore: () => write(initialState()),

        clearSort: () =>
          write({
            sidebar_sort_options: get().sidebar_sort_options.map((o) => ({
              ...o,
              fn: undefined,
              value: undefined,
            })),
          }),

        setEntities: (sidebar_raw_entities) =>
          write({
            sidebar_raw_entities: sidebar_raw_entities as
              | Array<SidebarEntity>
              | undefined,
          }),

        getEntities: () => {
          const {
            sidebar_raw_entities,
            sidebar_search_query,
            sidebar_filter_options,
            sidebar_sort_options,
          } = get()

          let result = [...(sidebar_raw_entities ?? [])]

          if (sidebar_search_query.trim()) {
            const q = sidebar_search_query.toLowerCase()
            result = result.filter((e) => e.name.toLowerCase().includes(q))
          }

          const activeFilters = sidebar_filter_options
            .filter((o) => o.fn)
            .map((o) => o.fn!)
          if (activeFilters.length)
            result = applyFiltersRecursively(result, activeFilters)

          const activeSorts = sidebar_sort_options
            .filter((o) => o.fn)
            .map((o) => o.fn!)
          if (activeSorts.length)
            result = applySortsRecursively(result, activeSorts)

          return result
        },

        setEntitiesLabel: (sidebar_entities_label) =>
          write({ sidebar_entities_label }),
        setIsEntitiesLoading: (sidebar_is_entities_loading) =>
          write({ sidebar_is_entities_loading }),
        setEntitiesError: (sidebar_entities_error) =>
          write({ sidebar_entities_error }),
        setSelectedEntityId: (sidebar_selected_entity_id) =>
          write({ sidebar_selected_entity_id }),
        setSearchQuery: (sidebar_search_query) => write({ sidebar_search_query }),

        setFilterOptions: (sidebar_filter_options) =>
          write({ sidebar_filter_options }),
        updateFilterOption: (key, option) =>
          write({
            sidebar_filter_options: get().sidebar_filter_options.map((o) =>
              o.key === key ? { ...o, ...option } : o
            ),
          }),
        getFilterOption: (key) =>
          get().sidebar_filter_options.find((o) => o.key === key),

        setSortOptions: (sidebar_sort_options) => write({ sidebar_sort_options }),
        updateSortOption: (key, option) =>
          write({
            sidebar_sort_options: get().sidebar_sort_options.map((o) =>
              o.key === key ? { ...o, ...option } : o
            ),
          }),
        getSortOption: (key) =>
          get().sidebar_sort_options.find((o) => o.key === key),

        setAddButton: (sidebar_add_button) => write({ sidebar_add_button }),
      },
    }
  }

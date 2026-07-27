import type { ReactNode } from 'react'

export type EntityId = string | number

export type SidebarEntityAction =
  | {
      icon?: ReactNode
      label: string
      destructive?: boolean
      to?: undefined
      onClick: () => void
    }
  | {
      icon?: ReactNode
      label: string
      destructive?: boolean
      to: string
      onClick?: undefined
    }

/**
 * One row in the list.
 *
 * `meta` carries your domain object untouched — filters and sorts read from it,
 * so the list can be filtered by anything on the record without the sidebar
 * knowing what a record is.
 */
export interface SidebarEntity<TMeta = unknown> {
  leading?: ReactNode
  id: EntityId
  name: string
  url: string
  meta?: TMeta
  /** Pinned rows: excluded from sorting and kept at the top. */
  disableSort?: boolean
  actionsDescription?: ReactNode
  actions?: Array<SidebarEntityAction>
  subEntities?: Array<SidebarEntity<TMeta>>
}

export type SidebarFilterFn<T extends SidebarEntity = SidebarEntity> = (
  entities: Array<T>
) => Array<T>

export type SidebarSortFn<T extends SidebarEntity = SidebarEntity> = (
  entities: Array<T>
) => Array<T>

/**
 * Filters and sorts are stored as *data*, not as booleans.
 *
 * Each option owns the control that renders it (`component`) and the function
 * that applies it (`fn`). An option with no `fn` is inactive — that is how a
 * filter is toggled off, rather than by removing it from the list, so the
 * control stays rendered and keeps its place.
 */
export interface FilterOption<
  T extends SidebarEntity = SidebarEntity,
  V = unknown,
> {
  key: string
  component: ReactNode
  fn?: SidebarFilterFn<T>
  value?: V
  isDefault?: boolean
}

export interface SortOption<
  T extends SidebarEntity = SidebarEntity,
  V = unknown,
> {
  key: string
  component: ReactNode
  fn?: SidebarSortFn<T>
  value?: V
}

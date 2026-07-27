import type {
  SidebarEntity,
  SidebarFilterFn,
  SidebarSortFn,
} from '../types/entity-sidebar'

// ─── Filters ─────────────────────────────────────────────────────────────────

/**
 * The general case: keep entities whose `meta` satisfies a predicate.
 *
 * Every filter below is this with a predicate filled in — reach for it directly
 * whenever the specific ones don't fit.
 */
export const filterSidebarByMeta =
  <T>(predicate: (meta: T | undefined) => boolean): SidebarFilterFn<SidebarEntity<T>> =>
  (entities) =>
    entities.filter((e) => predicate(e.meta))

/** Keep only entities flagged archived. */
export const filterSidebarByArchived = <
  T extends { archived?: boolean | null },
>(): SidebarFilterFn<SidebarEntity<T>> =>
  filterSidebarByMeta<T>((meta) => meta?.archived === true)

/** Keep everything not flagged archived — the usual default view. */
export const filterSidebarByActive = <
  T extends { archived?: boolean | null },
>(): SidebarFilterFn<SidebarEntity<T>> =>
  filterSidebarByMeta<T>((meta) => meta?.archived !== true)

/**
 * Keep entities whose condition is met or unknown.
 *
 * Note this is `!== false`, not `=== true`: an entity with no condition at all
 * is kept, and only an explicit `false` is filtered out.
 */
export const filterSidebarByConditionMet = <
  T extends { condition_met?: boolean | null },
>(): SidebarFilterFn<SidebarEntity<T>> =>
  filterSidebarByMeta<T>((meta) => meta?.condition_met !== false)

// ─── Sorts ───────────────────────────────────────────────────────────────────

export type NameSortDirection = 'a-z' | 'z-a'
export type DateSortDirection = 'asc' | 'desc'

/**
 * Entities marked `disableSort` are pinned: lifted out before sorting and put
 * back at the top, so "create new…" style rows keep their position.
 */
function withPinned<T extends SidebarEntity>(
  entities: Array<T>,
  compare: (a: T, b: T) => number
): Array<T> {
  const pinned = entities.filter((e) => e.disableSort === true)
  const sortable = entities.filter((e) => e.disableSort !== true)
  return [...pinned, ...[...sortable].sort(compare)]
}

export const sortSidebarByName =
  <T extends { name?: string | null }>(
    direction: NameSortDirection
  ): SidebarSortFn<SidebarEntity<T>> =>
  (entities) =>
    withPinned(entities, (a, b) => {
      const aName = a.meta?.name ?? ''
      const bName = b.meta?.name ?? ''
      return direction === 'a-z'
        ? aName.localeCompare(bName)
        : bName.localeCompare(aName)
    })

export const sortSidebarByCreatedAt =
  <T extends { created_at?: string | null }>(
    direction: DateSortDirection
  ): SidebarSortFn<SidebarEntity<T>> =>
  (entities) =>
    withPinned(entities, (a, b) => {
      const aTime = a.meta?.created_at ? new Date(a.meta.created_at).getTime() : 0
      const bTime = b.meta?.created_at ? new Date(b.meta.created_at).getTime() : 0
      return direction === 'asc' ? aTime - bTime : bTime - aTime
    })

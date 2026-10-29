import type { Breadcrumb, BreadcrumbRouteNode } from '../types/breadcrumbs'

/** Minimal structural `set` — compatible with zustand's `StateCreator` set. */
export type SetLike<TStore> = (
  partial: Partial<TStore> | ((state: TStore) => Partial<TStore>)
) => void

export interface BreadcrumbsSliceState {
  /**
   * Prepended to every trail. Useful for a persistent root ("Home", a tenant
   * switcher) that shouldn't be repeated in every route declaration.
   */
  breadcrumbs_leadingBreadcrumb?: Breadcrumb
  breadcrumbs_raw: Array<Breadcrumb>
}

export interface BreadcrumbsSliceActions {
  breadcrumbsActions: {
    setLeadingBreadcrumb: (breadcrumb?: Breadcrumb) => void
    setBreadcrumbs: (breadcrumbs: Array<Breadcrumb>) => void
    /** Takes a node from `createBreadcrumbRouter` and adopts its whole trail. */
    setBreadcrumbsFromRouter: (
      node: Pick<BreadcrumbRouteNode, '_breadcrumbs'>
    ) => void
  }
  breadcrumbsGetters: {
    /** The trail as rendered: leading crumb first, when set. */
    getBreadcrumbs: () => Array<Breadcrumb>
  }
}

export type BreadcrumbsSlice = BreadcrumbsSliceState & BreadcrumbsSliceActions

/**
 * Store-agnostic slice creator — spread into any zustand store:
 *
 * ```ts
 * const useAppStore = create<AppStore>()((set, get) => ({
 *   ...createBreadcrumbsSlice<AppStore>()(set, get),
 * }))
 * ```
 */
export const createBreadcrumbsSlice =
  <TStore extends BreadcrumbsSlice>() =>
  (set: SetLike<TStore>, get: () => TStore): BreadcrumbsSlice => {
    const write = (partial: Partial<BreadcrumbsSliceState>) =>
      set(partial as Partial<TStore>)

    return {
      breadcrumbs_leadingBreadcrumb: undefined,
      breadcrumbs_raw: [],

      breadcrumbsActions: {
        setLeadingBreadcrumb: (breadcrumbs_leadingBreadcrumb) =>
          write({ breadcrumbs_leadingBreadcrumb }),
        setBreadcrumbs: (breadcrumbs_raw) => write({ breadcrumbs_raw }),
        setBreadcrumbsFromRouter: (node) =>
          write({ breadcrumbs_raw: node._breadcrumbs }),
      },

      breadcrumbsGetters: {
        getBreadcrumbs: () => {
          const { breadcrumbs_leadingBreadcrumb, breadcrumbs_raw } = get()
          return breadcrumbs_leadingBreadcrumb
            ? [breadcrumbs_leadingBreadcrumb, ...breadcrumbs_raw]
            : [...breadcrumbs_raw]
        },
      },
    }
  }

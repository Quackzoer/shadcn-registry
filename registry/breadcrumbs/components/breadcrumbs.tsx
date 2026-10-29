'use client'

import { ChevronRight } from 'lucide-react'
import React, { useEffect } from 'react'

import type { BreadcrumbsSlice } from '../lib/breadcrumbs-slice'
import type { BreadcrumbRouteNode } from '../types/breadcrumbs'
import type { RouterAdapter } from '../types/router-adapter'

/** Structural shape of a zustand hook (`UseBoundStore<StoreApi<T>>`). */
export interface StoreHookLike<TStore> {
  <TReturn>(selector: (state: TStore) => TReturn): TReturn
}

/**
 * Binds the breadcrumb components to your store and router once:
 *
 * ```ts
 * export const Breadcrumbs = createBreadcrumbs(useAppStore, routerAdapter)
 * ```
 *
 * A factory rather than hardcoded imports, so the item needs to know neither
 * where your store lives nor which router you use.
 */
export function createBreadcrumbs<TStore extends BreadcrumbsSlice>(
  useStore: StoreHookLike<TStore>,
  router: RouterAdapter
) {
  function Breadcrumbs() {
    const breadcrumbs = useStore((s) => s.breadcrumbsGetters.getBreadcrumbs())

    return (
      <div className="min-w-0">
        <div className="flex items-end gap-1 overflow-x-auto whitespace-nowrap">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={crumb.key}>
              {crumb.component}
              <div className="flex h-[28px] items-center">
                {i + 1 < breadcrumbs.length && <ChevronRight size={16} />}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    )
  }

  /**
   * Declares where the current screen sits. Renders nothing.
   *
   * Put it in the layout for a route rather than in the page body, so the trail
   * is set by the nesting that is actually mounted.
   */
  function Setter({ node }: { node: Pick<BreadcrumbRouteNode, '_breadcrumbs'> }) {
    const setBreadcrumbsFromRouter = useStore(
      (s) => s.breadcrumbsActions.setBreadcrumbsFromRouter
    )
    const path = router.useCurrentPath()

    useEffect(() => {
      setBreadcrumbsFromRouter(node)
      // Depends on the path as well as the node: a layout can stay mounted
      // across a route change within its own subtree, and the trail still has
      // to be reasserted when a deeper layout unmounts.
    }, [path, node, setBreadcrumbsFromRouter])

    return null
  }

  Breadcrumbs.Setter = Setter
  return Breadcrumbs
}

import type { ReactNode } from 'react'

export interface Breadcrumb {
  key: string
  component: ReactNode
}

export interface BreadcrumbRouteConfig {
  key: string
  component: ReactNode
  routes?: Record<string, BreadcrumbRouteConfig>
}

/**
 * A node in the built router.
 *
 * Each node carries `_breadcrumbs` — its own full trail from the root — and is
 * also indexable by its child route names, so the tree is navigated with plain
 * property access and stays type-checked the whole way down:
 *
 * ```ts
 * breadcrumbsRouter.home.organization.project._breadcrumbs
 * ```
 */
export type BreadcrumbRouteNode<
  TRoutes extends Record<string, BreadcrumbRouteConfig> = Record<never, never>,
> = {
  key: string
  component: ReactNode
  _breadcrumbs: Breadcrumb[]
} & {
  [K in keyof TRoutes]: BreadcrumbRouteNode<
    TRoutes[K]['routes'] extends Record<string, BreadcrumbRouteConfig>
      ? TRoutes[K]['routes']
      : Record<never, never>
  >
}

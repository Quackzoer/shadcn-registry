import type {
  Breadcrumb,
  BreadcrumbRouteConfig,
  BreadcrumbRouteNode,
} from '../types/breadcrumbs'

/**
 * Builds a breadcrumb tree where every node already knows its full trail.
 *
 * Declaring the hierarchy once, separately from the route table, is what makes
 * this work: a screen says *where it is* rather than *what its trail is*, so
 * moving a route re-parents its breadcrumbs automatically and no screen can
 * drift out of sync with the nesting.
 *
 * ```ts
 * export const breadcrumbsRouter = createBreadcrumbRouter({
 *   home: {
 *     key: 'home',
 *     component: <BreadcrumbLink url="/" label="Home" />,
 *     routes: {
 *       organization: {
 *         key: 'organization',
 *         component: <OrganizationBreadcrumb />,
 *       },
 *     },
 *   },
 * })
 *
 * // in the organization layout:
 * <Breadcrumbs.Setter node={breadcrumbsRouter.home.organization} />
 * ```
 */
export function createBreadcrumbRouter<
  T extends Record<string, BreadcrumbRouteConfig>,
>(
  config: T,
  ancestors: Breadcrumb[] = []
): { [K in keyof T]: BreadcrumbRouteNode<NonNullable<T[K]['routes']>> } {
  return Object.fromEntries(
    Object.entries(config).map(([key, node]) => {
      const crumb: Breadcrumb = { key: node.key, component: node.component }
      const _breadcrumbs = [...ancestors, crumb]
      const children = node.routes
        ? createBreadcrumbRouter(node.routes, _breadcrumbs)
        : {}
      return [key, { key: node.key, component: node.component, _breadcrumbs, ...children }]
    })
  ) as { [K in keyof T]: BreadcrumbRouteNode<NonNullable<T[K]['routes']>> }
}

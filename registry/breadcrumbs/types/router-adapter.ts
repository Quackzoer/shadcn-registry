import type { ComponentType, ReactNode } from 'react'

/**
 * The two things breadcrumbs need from a router, supplied by you.
 *
 * Kept as an injected adapter rather than importing a router directly, so the
 * same item works under Next.js, React Router, TanStack Router, or none of
 * them — and so installing it never drags in a routing library you don't use.
 */
export interface RouterAdapter {
  /** Current path. Used to re-assert the trail on navigation. */
  useCurrentPath: () => string
  Link: ComponentType<{
    href: string
    className?: string
    onClick?: () => void
    children: ReactNode
  }>
}

/** React Router:
 * ```tsx
 * const adapter: RouterAdapter = {
 *   useCurrentPath: () => useLocation().pathname,
 *   Link: ({ href, ...props }) => <RouterLink to={href} {...props} />,
 * }
 * ```
 *
 * Next.js:
 * ```tsx
 * const adapter: RouterAdapter = {
 *   useCurrentPath: usePathname,
 *   Link: ({ href, ...props }) => <NextLink href={href} {...props} />,
 * }
 * ```
 */

# breadcrumbs

Declarative breadcrumbs for nested routes: declare the hierarchy once, and each
screen says only *where it is*.

```bash
npx shadcn@latest add https://shadcn.krzysztof.kazor.com/r/breadcrumbs.json
```

## The idea

A screen never spells out its own trail. It points at a node in a hierarchy you
declared separately, and the node already knows its ancestors:

```tsx
export const breadcrumbsRouter = createBreadcrumbRouter({
  home: {
    key: 'home',
    component: <BreadcrumbLink url="/" label="Home" />,
    routes: {
      organization: {
        key: 'organization',
        component: <OrganizationBreadcrumb />,
        routes: {
          project: { key: 'project', component: <ProjectBreadcrumb /> },
        },
      },
    },
  },
})

// in the project layout — that is the entire integration:
<Breadcrumbs.Setter node={breadcrumbsRouter.home.organization.project} />
```

Because the trail is derived from the declared nesting rather than restated per
screen, moving a route re-parents its breadcrumbs automatically. No screen can
drift out of sync with the hierarchy, which is the failure mode of trails
assembled by hand.

The built tree is indexable by route name and type-checked all the way down, so
`breadcrumbsRouter.home.organization.project` is verified, not stringly-typed.

## Setup

```ts
// store
const useAppStore = create<AppStore>()((set, get) => ({
  ...createBreadcrumbsSlice<AppStore>()(set, get),
}))

// router adapter — React Router
const routerAdapter: RouterAdapter = {
  useCurrentPath: () => useLocation().pathname,
  Link: ({ href, ...props }) => <RouterLink to={href} {...props} />,
}

// …or Next.js
const routerAdapter: RouterAdapter = {
  useCurrentPath: usePathname,
  Link: ({ href, ...props }) => <NextLink href={href} {...props} />,
}

// components — bound to your store and router once
export const Breadcrumbs = createBreadcrumbs(useAppStore, routerAdapter)
```

The router is injected rather than imported, so this item works under Next.js,
React Router, TanStack Router or none of them — and installing it never pulls
in a routing library you don't use.

Then render `<Breadcrumbs />` in your shell and `<Breadcrumbs.Setter node={…} />`
in each route layout.

Put the `Setter` in the **layout** for a route, not the page body — the trail
should be set by the nesting that is actually mounted.

## Leading crumb

`setLeadingBreadcrumb` prepends a crumb to every trail. Useful for a persistent
root — a home link or tenant switcher — that would otherwise be repeated in
every route declaration.

## `EntityBreadcrumb`

A segment that is also a switcher: it names the current entity and opens a
searchable list of its siblings. Generic over whatever entities you hand it —
wrap it per entity type to supply the list:

```tsx
export function ProjectBreadcrumb() {
  const { projectId } = useParams()
  const projects = useAppStore((s) => s.project_list) ?? []
  return (
    <EntityBreadcrumb
      label="Project"
      currentlySelectedId={projectId ?? ''}
      entities={projects.map((p) => ({
        id: String(p.id),
        name: p.name,
        url: `/project/${p.id}`,
      }))}
      Link={routerAdapter.Link}
    />
  )
}
```

The selected entity is floated to the top of the list, so the current item is
always the first thing under the cursor when it opens.

## Not included

The app this came from also had a `BreadcrumbLink` that resolved URLs from
typed route params. That is inherently app-shaped — it hardcodes your param
names — so it is left out. A plain `<Link>` covers the same ground; the
`component` on a route node is arbitrary JSX.

## Requirements

`zustand`, plus whatever router you wire into the adapter. No routing library
is imported by this item.

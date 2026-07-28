/**
 * Every demo route, in one place.
 *
 * The header nav and the home page both render from this list. They used to be
 * two hardcoded lists and had already drifted apart — the nav was missing four
 * routes that existed, and the two disagreed about which. Add a route here and
 * both pick it up.
 */
export interface Demo {
  href: string
  label: string
  description: string
}

export const demos: Demo[] = [
  {
    href: '/search-input',
    label: 'Search Input',
    description: 'Debounced search over any list with a supplied filter function',
  },
  {
    href: '/action-button',
    label: 'Action Button',
    description: 'Async action button with confirmation dialog and tooltip',
  },
  {
    href: '/store-slice',
    label: 'Store Slice',
    description: 'Composable zustand slices that mirror TanStack Query',
  },
  {
    href: '/combobox',
    label: 'Combobox',
    description: 'Composable combobox built on Base UI primitives',
  },
  {
    href: '/dynamic-dialog',
    label: 'Dynamic Dialog',
    description: 'Programmatic, awaitable dialogs',
  },
  {
    href: '/react-query-factory',
    label: 'React Query Factory',
    description: 'Typed query-hook factories',
  },
  {
    href: '/mark-searched-phrase',
    label: 'Mark Searched Phrase',
    description: 'Highlights a matched phrase inside text',
  },
  {
    href: '/permission-guard',
    label: 'Permission Guard',
    description: 'Renders children only for permitted users',
  },
  {
    href: '/tanstack-form-components',
    label: 'TanStack Form Components',
    description: 'Form field components built on TanStack Form',
  },
]

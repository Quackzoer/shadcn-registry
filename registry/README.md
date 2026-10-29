# Registry

One directory per item. Everything belonging to an item lives inside that
item's directory; items that serve different purposes never share a directory.

```
registry/<item-name>/
├── components/   React components (nested subfolders where a family exists)
├── hooks/        React hooks
├── lib/          non-React logic: state, adapters, factories
├── types/        type-only modules
├── docs/         design notes for the item
└── README.md     what it is, how to install it, how to use it
```

This follows shadcn's own registry guidance: files within a registry item are
organized into `components` / `hooks` / `lib`, and imports between them use
`@/registry/<item>/…` paths, which the CLI rewrites to the consuming project's
aliases on install.

Two directories at the repo root are deliberately **not** part of this scheme:

- `components/ui/` — vendored shadcn primitives, managed by the CLI. `shadcn add button` writes here.
- `lib/utils.ts` — the standard `cn` helper every primitive imports.

## Items

| Item | Published | Demo | What it is |
| --- | --- | --- | --- |
| [`store-slice`](./store-slice) | ✅ | [`/store-slice`](../app/store-slice) | Composable zustand slices that mirror TanStack Query |
| [`data-table`](./data-table) | ✅ | — | Virtualized TanStack Table with per-instance state, row grouping, filters popover |
| [`combobox`](./combobox) | ✅ | [`/combobox`](../app/combobox) | Composable combobox built on Base UI primitives |
| [`action-button`](./action-button) | ✅ | [`/action-button`](../app/action-button) | Button that runs an async action, with confirm dialog and tooltip |
| [`search-input`](./search-input) | ✅ | [`/search-input`](../app/search-input) | Debounced search over any list via a user-supplied filter, with result count |
| [`loading-swap`](./loading-swap) | ✅ | — | Swaps content for a spinner without resizing. **Third-party** (WDS, MIT) |
| [`breadcrumbs`](./breadcrumbs) | ✅ | — | Declarative breadcrumbs for nested routes; router-agnostic |
| [`entity-sidebar`](./entity-sidebar) | ✅ | — | State + filter/sort primitives for a searchable entity list |
| [`layout-slots`](./layout-slots) | ✅ | — | Nested routes render into a parent layout; slots clear on unmount |
| [`react-hooks`](./react-hooks) | ✅ | — | Six small hooks: click-outside, element size, remaining height, … |
| [`ts-utils`](./ts-utils) | ✅ | — | Type-level utilities: `Prettify`, `Autocomplete`, `CommonProperties`, … |
| [`dynamic-dialog`](./dynamic-dialog) | ✅ | [`/dynamic-dialog`](../app/dynamic-dialog) | Sonner-style programmatic dialogs, plus five prebuilt dialog types |
| [`react-query`](./react-query) | ✅ | [`/react-query-factory`](../app/react-query-factory) | Query-hook factories and query-key conventions |
| [`field-label`](./field-label) | ✅ | — | Form label with a required asterisk driven by the Zod schema |
| [`mark-searched-phrase`](./mark-searched-phrase) | ✅ | [`/mark-searched-phrase`](../app/mark-searched-phrase) | Highlights a matched phrase inside text |
| [`permission-guard`](./permission-guard) | ✅ | [`/permission-guard`](../app/permission-guard) | Renders children only for permitted users |
| [`multi-step-form`](./multi-step-form) | ✅ | — | Multi-step form with per-step validation and navigation |
| [`devtools`](./devtools) | — | — | Pluggable in-app devtools drawer. Typechecks clean; a publishing candidate |
| [`tanstack-form`](./tanstack-form) | — | [`/tanstack-form-components`](../app/tanstack-form-components) | TanStack Form field components. **Does not typecheck** yet |

### State-only items

`entity-sidebar`, `layout-slots` and (partly) `breadcrumbs` ship state and
logic without the surrounding chrome. That was deliberate in each case: the
shells they came from were bound to app-specific concerns — a user avatar and
sign-out, a particular page-header field set, typed route params — and chrome
is exactly where apps diverge. What generalises is the model underneath.

"Published" means the item has an entry in `registry.json` and is served from
`public/r/<name>.json`. The three unpublished items are organized here but
intentionally left out of `registry.json` — publishing code that does not
compile would hand consumers broken files.

## Adding an item

1. Create `registry/<item-name>/` with whichever of `components` / `hooks` /
   `lib` / `types` it actually needs.
2. Import between the item's own files with `@/registry/<item-name>/…`.
   Import shadcn primitives with `@/components/ui/…`.
3. Add an entry to `registry.json`. Give every file an explicit `target` so
   the installed layout is predictable rather than inferred.
4. Add a demo under `app/<item-name>/` and link it from `app/page.tsx`.
5. `npm run registry:build`.

### A note on `target` and multi-folder items

For an item whose files import each other across subfolders, keep the whole
item under a single target root (`store-slice` uses `@lib/store-slice/…`) and
use **relative** imports between its files. The relative paths then survive
installation unchanged, so the item works no matter what path aliases the
consuming project has configured.

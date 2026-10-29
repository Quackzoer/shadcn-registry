# layout-slots

Lets a deeply nested route render content into a parent layout — a page title,
header buttons, a status chip — without prop drilling or a context per slot.

```bash
npx shadcn@latest add https://shadcn.krzysztof.kazor.com/r/layout-slots.json
```

## The problem

A layout renders the page chrome; the content that belongs in that chrome is
decided several routes deeper. The usual workarounds are all unpleasant: thread
props through every layout, create a context per slot, or portal into a DOM node
by id and lose type safety.

Here the parent renders a slot and any descendant fills it. Neither imports the
other.

```tsx
// layout
function AppLayout() {
  const actions = useSlotContent('header-actions')
  return (
    <div>
      <header>
        {useSlotContent('title')}
        <div className="ml-auto">{actions}</div>
      </header>
      <Outlet />
    </div>
  )
}

// any page below it
function ProjectPage() {
  useLayoutSlot('title', <h1>{project.name}</h1>)
  useLayoutSlot('header-actions', <Button onClick={archive}>Archive</Button>)
  return <ProjectBody />
}
```

## Setup

```ts
type Slot = 'title' | 'header-actions' | 'footer-actions'

const useAppStore = create<AppStore>()((set, get) => ({
  ...createLayoutSlotsSlice<AppStore, Slot>()(set, get),
}))

export const { useLayoutSlot, useSlotContent } =
  createLayoutSlotHooks<AppStore, Slot>(useAppStore)
```

Constraining `TSlot` to a union is worth the two lines. Slot names are a
contract between two files that never import each other, so a typo is otherwise
completely silent — the content just never appears, with no error anywhere.

## Slots clear on unmount

`useLayoutSlot` fills a slot while its component is mounted and clears it on
unmount. This is the part that makes the pattern safe to use.

Without it, a route that sets header actions leaves them behind when the user
navigates away, and the next screen inherits buttons that act on an entity it
is no longer showing. The version this was extracted from had exactly that
shape — layouts pushed content in and nothing took it out, so every screen had
to remember to reset the fields it didn't use.

If you do want content to persist deliberately, call
`layoutSlotActions.setSlot` directly instead of using the hook.

## Note on the extraction

The app this came from had a fixed set of fields — `name`, `description`,
`link`, plus three action slots — baked into the slice and a matching layout
component. Both are left out: the field set was specific to that app's page
header, and the layout chrome around it more so.

What generalises is the mechanism, so that is what this ships. Name your own
slots; render them however you like.

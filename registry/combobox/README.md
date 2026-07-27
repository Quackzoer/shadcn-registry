# combobox

A thin, composable wrapper over [Base UI](https://base-ui.com)'s Combobox
primitives. Every part is a separate export, so the layout stays yours to
arrange — there is no single all-in-one component with a fixed prop surface.

```bash
npx shadcn@latest add https://shadcn.krzysztof.kazor.com/r/combobox.json
```

Demo: [`/combobox`](../../app/combobox)

## Exports

| Export | Purpose |
| --- | --- |
| `Combobox` | the root; takes `items`, `value`, `onValueChange`, `multiple`, `autoHighlight` |
| `ComboboxInput` | single-line input trigger |
| `ComboboxTrigger` / `ComboboxValue` | trigger surface and the selected-value slot |
| `ComboboxContent` | the popup; accepts `anchor`, `side`, `align`, `sideOffset`, `alignOffset` |
| `ComboboxList` | list body; takes a **function child** `(item) => …` driven by the root's `items` |
| `ComboboxItem` | one option |
| `ComboboxGroup` / `ComboboxLabel` / `ComboboxSeparator` | sectioning |
| `ComboboxEmpty` | rendered when nothing matches |
| `ComboboxCollection` | Base UI collection passthrough |
| `ComboboxChips` / `ComboboxChip` / `ComboboxChipsInput` | multi-select chip UI |
| `ComboboxClear` | clear button |
| `useComboboxAnchor` | ref to anchor the popup to a container rather than the input |

## Multi-select shape

The chips pattern is the one this component is most used for. Note that the
anchor ref goes on the *wrapping element*, and is then handed to
`ComboboxContent` so the popup lines up with the chip container instead of the
inner input:

```tsx
const anchor = useComboboxAnchor()

<div ref={anchor}>
  <Combobox
    multiple
    autoHighlight
    items={frameworks}
    value={selected}
    onValueChange={setSelected}
  >
    <ComboboxChips>
      <ComboboxValue>
        <>
          {selected.map((id) => (
            <ComboboxChip key={id}>{labelFor(id)}</ComboboxChip>
          ))}
        </>
        <ComboboxChipsInput />
      </ComboboxValue>
    </ComboboxChips>

    <ComboboxContent anchor={anchor}>
      <ComboboxList>
        {(item) => (
          <ComboboxItem key={item.id} value={item.id}>
            {item.name}
          </ComboboxItem>
        )}
      </ComboboxList>
      <ComboboxEmpty>No results.</ComboboxEmpty>
    </ComboboxContent>
  </Combobox>
</div>
```

Two things that are easy to get wrong:

- `ComboboxValue` takes **children**, not a render prop. The chips are mapped
  from your own state, and `ComboboxChipsInput` sits as a sibling inside it.
- `ComboboxList` takes a **function child**. The argument comes from the
  `items` array on the root, so `items` and the list body must agree.

## Dependencies

Requires `@base-ui/react`. This is the only item in the registry built on Base
UI rather than Radix — the two coexist fine, but it is a distinct dependency
tree, so installing this pulls in a package the rest of the registry does not
use.

The chip-remove button renders as `Button size="icon-sm"`. The original used a
non-standard `icon-xs` size; that was changed so the component works against a
stock shadcn `button.tsx` with no extra variant. If you prefer the tighter
original spacing, add an `icon-xs` size to your button and change it back.

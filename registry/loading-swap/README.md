# loading-swap

Swaps content for a spinner without the element changing size.

```bash
npx shadcn@latest add https://shadcn.krzysztof.kazor.com/r/loading-swap.json
```

## Credit

**This is not my component.** It is
[WebDevSimplified's LoadingSwap](https://wds-shadcn-registry.netlify.app/components/loading-swap/)
([source](https://github.com/WebDevSimplified/wds-shadcn-registry)), republished
here unmodified under its MIT license so that
[`action-button`](../action-button) can depend on an item in this registry
rather than reaching across to another one.

If you want it on its own, prefer installing from the original:

```bash
npx shadcn@latest add https://wds-shadcn-registry.netlify.app/r/loading-swap.json
```

That way you track their updates directly. The copy here exists to keep this
registry's dependency graph self-contained; it is not an improvement on theirs
and will not diverge from it.

The MIT notice travels in the file header, as the license requires. See
[`LICENSE`](./LICENSE).

## What it does

```tsx
<LoadingSwap isLoading={isPending}>Save</LoadingSwap>
```

Both the children and the spinner occupy the same single grid cell, and
visibility toggles between them. Because the hidden one still takes up space,
the element keeps its size — a button labelled "Save changes" doesn't collapse
to spinner-width and shove the layout around mid-request.

That's the whole idea: `visibility: hidden` rather than unmounting.

| Prop | Type | |
| --- | --- | --- |
| `isLoading` | `boolean` | which layer is visible |
| `children` | `ReactNode` | shown when not loading |
| `className` | `string` | applied to **both** layers |

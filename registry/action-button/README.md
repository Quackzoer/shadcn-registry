# action-button

A `Button` that runs an async action — spinner while in flight, optional
confirmation first, optional tooltip.

```bash
npx shadcn@latest add https://shadcn.krzysztof.kazor.com/r/action-button.json
```

Demo: [`/action-button`](../../app/action-button)

## Credit

This is an adaptation of **[WebDevSimplified's ActionButton](https://wds-shadcn-registry.netlify.app/components/action-button/)**
([source](https://github.com/WebDevSimplified/wds-shadcn-registry/blob/main/src/registry/new-york/items/action-button/components/action-button.tsx)).
The idea, the prop names, and the `LoadingSwap` treatment are theirs.

`LoadingSwap` is republished as its own item in this registry —
[`loading-swap`](../loading-swap) — unmodified and under its MIT license, so
this registry's dependency graph stays self-contained. If you want `LoadingSwap`
on its own, install it from [their registry](https://wds-shadcn-registry.netlify.app/components/loading-swap/)
instead and track their updates directly.

## It wraps Button, it doesn't replace it

`ActionButton` renders the stock `Button` internally and spreads every prop
into it, so `variant`, `size`, `className`, `asChild` and the rest behave
exactly as they always do. Your existing `button.tsx` is untouched — this sits
alongside it and you reach for it only when a button needs to run an action.

```tsx
<ActionButton variant="destructive" size="sm" action={deleteProject}>
  Delete
</ActionButton>
```

## Props

Everything `Button` takes, plus:

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `action` | `() => Promise<ActionResult \| void>` | — | the work to run |
| `requireAreYouSure` | `boolean` | `false` | confirm before running |
| `areYouSureTitle` | `ReactNode` | `"Are you sure?"` | |
| `areYouSureDescription` | `ReactNode` | `"This action cannot be undone."` | |
| `areYouSureConfirmText` | `string` | `"Yes"` | |
| `areYouSureCancelText` | `string` | `"Cancel"` | |
| `tooltip` | `ReactNode` | — | omit for no tooltip |
| `tooltipSide` | `"top" \| "right" \| "bottom" \| "left"` | — | |
| `onClick` | `(e) => void` | — | runs first; `preventDefault()` cancels |

`ActionResult` is `{ error: boolean; message?: string }`. Returning it with
`error: true` toasts the message.

## What changed from the original

**The confirmation uses `confirmDialog` instead of an inline `AlertDialog`.**
The original has to return one of two different JSX trees depending on
`requireAreYouSure`, because the dialog must exist in the render output to be
openable. Awaiting a promise-based dialog collapses that into one linear path:

```tsx
if (requireAreYouSure) {
  const { confirmed } = await confirmDialog({ props: { header: { … } } })
  if (!confirmed) return
}
runAction()
```

One consequence worth knowing: **the spinner now appears on the button, not in
the dialog.** The original kept the dialog open during the action
(`open={isLoading ? true : undefined}`) and swapped the "Yes" button for a
spinner. Here the dialog closes on confirm and the originating button shows the
loading state. Both are defensible; this one keeps the dialog from lingering
over the thing it's acting on.

This needs `<DynamicDialogProvider />` mounted once in your tree.

**`action` may return `void`.** The original types it as always returning
`{ error, message? }` and reads `data.error` unconditionally — an action that
returns nothing throws at runtime. Here a `void` return means "nothing to
report", so simple actions need no ceremony.

**`onClick` runs before the action and can cancel it.** In the original,
`performAction()` fires *before* `props.onClick?.(e)`, so an onClick handler
cannot prevent the action — by the time it runs, the work has already started.
Reordering makes `preventDefault()` meaningful, which is what you want for
client-side validation.

**Tooltip, including while disabled.** A disabled button emits no pointer
events, so a tooltip attached directly to it goes silent exactly when it's most
useful — explaining *why* the button is disabled. When disabled, the trigger is
wrapped in a focusable `<span>` so hover and keyboard focus still reach it.

## Dependencies

`sonner` for the error toast. Registry: `button`, `tooltip`, `loading-swap`,
`dynamic-dialog`, `dynamic-dialog-confirmation`.

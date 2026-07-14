# Dynamic Dialog — Development Notes

Notes from the 2026-06-28 architecture review. Each item is marked with its status.

---

## Pending Refactors

### TypeToConfirmDialog — hardcoded copy
`dialogs/type-to-confirm-dialog.tsx` has hardcoded title ("Delete Confirmation"), description ("This action cannot be undone"), button label ("Delete Forever"), and `Trash2` icon baked in. The prop interface only exposes `itemName`. Needs these props added before it can be reused for non-delete flows:
```ts
title?: ReactNode
description?: ReactNode
confirmLabel?: string
icon?: ReactNode
```

### Inline `<style>` keyframe injection
`countdown-dialog.tsx` and `delayed-action-dialog.tsx` both inject `@keyframes` rules into the DOM via `<style>` tags at render time (`__cd-bar`, `__cd-circle`, `__dal-bar`, `__dal-circle`). When two instances are open simultaneously the rules are duplicated. Replace with JS-driven animation state or Tailwind `animate-*` utilities.

### Timer `useEffect` deps suppression
Both countdown and delayed-action dialogs suppress the `react-hooks/exhaustive-deps` lint rule to omit `props.confirm`/`props.dismiss` from deps. The suppression is correct (those functions are stable for the dialog's lifetime), but the comment just says "stable" without explaining *why* (the observable creates a new closure per dialog id and never mutates it). Improve the comment or restructure to use a ref.

### isFormValid redundancy in TypeToConfirmDialog
`type-to-confirm-dialog.tsx:30` does:
```ts
const isFormValid = form.formState.isValid && form.watch('itemName') === props.itemName;
```
Both checks are equivalent given the `z.literal(props.itemName)` schema. Also `form.watch()` adds an extra subscription per render. Use only `form.formState.isValid`.

---

## Planned Work (not yet implemented)

### `renderAction` abstraction
`confirm-dialog.tsx` has `renderAction` + `ConfirmDialogAction<T>` type union. This will eventually become a shared library primitive. When abstracting: clean up the `customButtons` no-op `defaultOnClick` (currently `() => {}`) — either enforce that string-only custom buttons aren't allowed, or require `onClick` on every custom button descriptor.

### `variant` prop standardization
Each built-in dialog handles danger/warning styling ad-hoc. Consider a shared `variant?: 'default' | 'destructive' | 'warning'` across all built-in dialogs. Decision deferred — need to see how the abstraction shapes up first.

### Max concurrent dialogs
`DynamicDialogProvider` could accept `maxDialogs?: number`. Complexity: when limit is hit, the oldest dialog's promise must still be resolved (can't just drop it). Considered low-priority.

---

## Already Fixed

| # | Issue | Fix |
|---|-------|-----|
| 1 | Hardcoded 300ms unmount delay decoupled from CSS animation | `DynamicDialogProvider` now accepts `removeDelay?: number` (default 300) |
| 2 | `pendingDialogs` leaked on provider unmount | `useEffect` cleanup calls `dismissAllDialogs('close')` |
| 3 | `showDialog` omitted `update()` from return type | `showDialog` now returns full `DialogResult<T, Record<string, unknown>>` |
| 4 | `confirm()` accepted no argument even for typed value types | `ConfirmFn<T>` conditional type: required when T is concrete, optional when T is `void`/`unknown` |
| 5 | `confirmDialog` called `confirm()` without passing `true` | Fixed to `confirm(true)` |
| 6 | No way to query pending dialog state from outside React | `dialogObservable.getPendingIds()` and `hasPending(id)` added |
| 7 | `beforeClose` for user-initiated close interception | `DialogOptions.beforeClose?: () => boolean \| Promise<boolean>` wired through to `DynamicDialogItem.onOpenChange` |
| 8 | No blocking/loading dialog type | `LoadingDialog` + `loadingDialog` factory added; accepts `promise` prop that auto-dismisses with reason `"success"` on resolve or `"error"` on reject; `allowCancel` defaults false |

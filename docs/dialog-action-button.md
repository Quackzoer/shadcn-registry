# DialogActionButton — Design Document

## Motivation

**1. Redundant show/hide controls.**
`showCancel?: boolean` and `cancelButton?` are separate. `cancelButton: undefined` does NOT hide the button — you also need `showCancel: false`. Two props doing one job.

**2. `renderAction` is private and not reusable.**
Lived only in `confirm-dialog.tsx`. Other dialogs hardcoded their own button HTML, causing layout/spacing divergence.

**3. The descriptor type was too narrow.**
The old `{ label: string, onClick: ... }` form couldn't accept `variant`, `size`, `className`, `disabled`, `form`, etc. Callers had to use a full render function for anything visual.

**4. No channel for component state to reach button logic.**
`TypeToConfirmDialog` needed form validity to control `disabled` on the confirm button, but there was no path for that state through the button API.

**5. No canonical slot system.**
Custom buttons had no meaningful default action, and there was no structured way to add a named intermediate slot.

---

## Implementation — `registry/lib/dialog-actions.tsx`

---

## `DialogActionButtonDescriptor<T, TCtx = undefined>`

The static object configuration form. Extends **all** `Button` component props so callers get full visual control without needing a render function just to change a prop. `label` and `onClick` are optional — omitting either inherits from the slot's defaults.

```ts
type DialogActionButtonDescriptor<T, TCtx = undefined> =
  Omit<React.ComponentProps<typeof Button>, 'onClick' | 'disabled' | 'children'> & {
    label?: ReactNode;
    onClick?: (actions: DialogActions<T>, ctx: TCtx) => void;
    disabled?: boolean;  // always static — use the callback variant for dynamic disabled
  };
```

`disabled` is always a plain boolean in the descriptor. For disabled state that depends on context (form validity, countdown timer, etc.) use the **callback variant** of `DialogActionButton` which returns a full descriptor after consulting state:

```ts
// Static disabled — always disabled
confirmButton={{ disabled: true }}

// Dynamic disabled — use callback, return descriptor
confirmButton={(actions, ctx) => ({
  label: 'Submit',
  variant: 'destructive',
  disabled: !ctx.isValid,
})}
```

This keeps the descriptor shape simple (no function fields beyond `onClick`) while the callback form gives access to all state uniformly.

---

## `DialogActionButton<T, TCtx = undefined>`

The main union type for a single button slot:

```ts
type DialogActionButton<T, TCtx = undefined> =
  | true                          // show with all slot defaults
  | false                         // explicitly hide (same as undefined)
  | string                        // custom label, rest from slot defaults
  | DialogActionButtonDescriptor<T, TCtx>
  | ((actions: DialogActions<T>, ctx: TCtx) =>
      DialogActionButtonDescriptor<T, TCtx> | ReactNode)  // callback: full dynamic control
  | ReactNode;                    // static JSX: no dialog/context access
```

`undefined` and `false` both mean "don't render". The callback form is the bridge between simple static config and fully custom JSX — it returns a descriptor (processed through the normal resolution) or arbitrary ReactNode.

### Variant decision guide

| You want to… | Use |
|---|---|
| Show with all slot defaults | `true` |
| Hide explicitly | `false` |
| Change only the label | `"My label"` |
| Change variant, keep default label | `{ variant: 'ghost' }` |
| Change label + variant + custom click | `{ label: 'Save', variant: 'default', onClick: (a) => a.confirm(true) }` |
| Submit an external form by id | `{ type: 'submit', form: 'my-form-id', label: 'Save' }` |
| Dynamic disabled from context | `(_, ctx) => ({ disabled: !ctx.isValid, label: 'Submit' })` |
| Dynamic label from context | `(_, ctx) => ({ label: ctx.timeLeft > 0 ? \`Wait (${ctx.timeLeft}s)\` : 'Confirm' })` |
| Fully custom, needs local state | `(actions) => <MyStatefulButton actions={actions} />` |
| Static custom element | `<a href="/help">Help</a>` |

### Why the callback returns a descriptor (not just ReactNode)

If the callback could only return `ReactNode`, dynamic content would always bypass the default merging logic (variant, type, onClick fallback). By returning a descriptor, the callback participates in the same resolution — it can set `disabled: !ctx.isValid` while still inheriting the slot's `variant`, `type`, and `onClick` defaults. Returning `ReactNode` from the callback is the full-escape path when you want none of that.

---

## `DialogActionButtonSlotDefaults<T, TCtx = undefined>`

Same shape as the descriptor but `label` and `onClick` are **required**. Dialogs provide this per slot to define what "show with defaults" means for that slot. Extending Button props means `type`, `form`, `size`, `className`, etc. can all be set as defaults:

```ts
type DialogActionButtonSlotDefaults<T, TCtx = undefined> =
  DialogActionButtonDescriptor<T, TCtx> & {
    label: ReactNode;
    onClick: (actions: DialogActions<T>, ctx: TCtx) => void;
  };
```

---

## `DialogActionsContainer<T, TCtx = undefined>`

Controls the wrapper element around all rendered buttons:

```ts
type DialogActionsContainer<T, TCtx = undefined> =
  | React.ComponentProps<'div'>
  | ((children: ReactNode, dialogActions: DialogActions<T>, ctx: TCtx) => ReactNode);
```

**Div props**: `className` merges with the default layout (`flex justify-end gap-3 pt-2`). All other props pass through.

**Render function**: receives rendered button nodes + dialog methods + context. Full escape hatch for custom layouts, permission gates, etc.

---

## Each dialog defines its own actions shape

There is no shared `DialogActionsConfig<T>` interface with fixed `cancelButton`/`confirmButton` slots. Each dialog defines its own interface using `DialogActionButton` directly, naming slots semantically for that dialog:

```ts
// confirmDialog — cancel + optional custom + confirm
export interface ConfirmDialogActionsConfig {
  cancelButton?: DialogActionButton<ResolveValue>;
  customButtons?: DialogActionButton<ResolveValue>[];
  confirmButton?: DialogActionButton<ResolveValue>;
  container?: DialogActionsContainer<ResolveValue>;
}

// typeToConfirmDialog — same slots but with form-state context
type TCtx = { isValid: boolean };
export interface TypeToConfirmActionsConfig {
  cancelButton?: DialogActionButton<ResolveValue, TCtx>;
  confirmButton?: DialogActionButton<ResolveValue, TCtx>;
  container?: DialogActionsContainer<ResolveValue, TCtx>;
}

// A hypothetical snooze dialog — three semantic slots
export interface SnoozeDialogActionsConfig {
  dismissButton?: DialogActionButton<SnoozeResult>;
  snoozeButton?: DialogActionButton<SnoozeResult>;
  confirmButton?: DialogActionButton<SnoozeResult>;
  container?: DialogActionsContainer<SnoozeResult>;
}

// loadingDialog — no user-facing action buttons at all (no actions prop)
```

Dialogs without a confirm button simply don't include it. There is no `confirmButton: false` ceremony to suppress a slot that was never there.

---

## `renderDialogButton<T, TCtx>` — exported primitive

The core renderer for a single `DialogActionButton` value. Use this directly when you need per-slot control (e.g. a countdown timer controls `disabled` at the call site rather than through context):

```ts
function renderDialogButton<T, TCtx = undefined>(
  button: DialogActionButton<T, TCtx> | undefined,
  dialogActions: DialogActions<T>,
  ctx: TCtx,
  defaults: DialogActionButtonSlotDefaults<T, TCtx>,
): ReactNode
```

### Resolution order

```
undefined | false | null  →  null
function (callback)       →  call(actions, ctx) → re-resolve result recursively
true                      →  Button spread from defaults
string                    →  Button from defaults with label replaced
React element / array     →  rendered as-is (ReactNode)
plain object (descriptor) →  Button: descriptor merged over defaults (descriptor wins per field)
```

The recursive call for the callback case means the callback's returned descriptor goes through the same resolution — it inherits any defaults fields it doesn't override.

### Descriptor merge detail

```ts
// Descriptor props are spread AFTER defaults, so descriptor wins for all fields.
<Button
  {...defButtonProps}     // defaults: type, variant, form, size, className, …
  {...descButtonProps}    // descriptor overrides: variant, className, form, …
  disabled={descriptor.disabled ?? defaults.disabled}
  onClick={() => (descriptor.onClick ?? defaults.onClick)(dialogActions, ctx)}
>
  {descriptor.label ?? defaults.label}
</Button>
```

---

## `renderDialogActions<T, TCtx>` — ordered slot list renderer

Takes an array of `DialogButtonSlot` objects (each with a button value and its defaults) and renders them in order. The array's order IS the render order — the dialog controls it.

```ts
interface DialogButtonSlot<T, TCtx = undefined> {
  button: DialogActionButton<T, TCtx> | undefined;
  defaults: DialogActionButtonSlotDefaults<T, TCtx>;
  key?: string;
}

function renderDialogActions<T, TCtx = undefined>(
  slots: DialogButtonSlot<T, TCtx>[],
  dialogActions: DialogActions<T>,
  ctx: TCtx,
  container?: DialogActionsContainer<T, TCtx>,
): ReactNode
```

Essentially `slots.map(renderDialogButton)` with a container div.

---

## `renderStandardDialogActions<T, TCtx>` — the layout helper

The convenience function for the most common layout: **[cancel] [custom…] [confirm]**. Each slot shows with defaults when the user doesn't configure it; pass `false` to explicitly hide.

```ts
interface StandardDialogActionsConfig<T, TCtx = undefined> {
  cancelButton?: DialogActionButton<T, TCtx>;
  customButtons?: DialogActionButton<T, TCtx>[];
  confirmButton?: DialogActionButton<T, TCtx>;
  container?: DialogActionsContainer<T, TCtx>;
}

interface StandardDialogActionsDefaults<T, TCtx = undefined> {
  cancel?: DialogActionButtonSlotDefaults<T, TCtx>;
  confirm?: DialogActionButtonSlotDefaults<T, TCtx>;
}

function renderStandardDialogActions<T, TCtx = undefined>(
  config: StandardDialogActionsConfig<T, TCtx>,
  dialogActions: DialogActions<T>,
  ctx: TCtx,
  defaults: StandardDialogActionsDefaults<T, TCtx>,
): ReactNode
```

`customButtons` have no dialog-level semantic defaults — they must be fully self-specified (descriptor, callback, or ReactNode).

---

## Usage across dialogs

### `confirmDialog` — no context needed

```tsx
{renderStandardDialogActions(
  props.actions ?? {},
  props,
  undefined,
  {
    cancel: {
      label: 'Cancel',
      variant: 'outline',
      type: 'button',
      onClick: (a) => a.dismiss('cancel'),
    },
    confirm: {
      label: 'Confirm',
      variant: 'destructive',
      type: 'submit',
      onClick: (a) => a.confirm(true),
    },
  },
)}
```

### `typeToConfirmDialog` — context carries form state

The confirm button's disabled state depends on form validity. Rather than making `disabled` a function in the descriptor, this is handled by passing form state as context. The `disabled` in the defaults is a static boolean evaluated at render time:

```tsx
const ctx = { isValid: form.formState.isValid };

{renderStandardDialogActions(
  props.actions ?? {},
  props,
  ctx,
  {
    cancel: {
      label: 'Cancel',
      variant: 'outline',
      type: 'button',
      onClick: (a) => a.dismiss('cancel'),
    },
    confirm: {
      label: 'Delete Forever',
      variant: 'destructive',
      type: 'submit',
      form: formId,             // links to <form id={formId}> via useId()
      disabled: !ctx.isValid,   // evaluated at render time from component state
    },
  },
)}
```

Users who override `confirmButton` with the callback form also receive `ctx`:
```ts
typeToConfirmDialog({
  props: {
    itemName: 'my-file.txt',
    actions: {
      confirmButton: (actions, ctx) => ({
        label: ctx.isValid ? 'Delete Forever' : 'Type the name first',
        variant: 'destructive',
        disabled: !ctx.isValid,
      }),
    },
  },
})
```

### `countdownDialog` — timer-dependent disabled via `renderDialogButton`

The countdown dialog's confirm button has `disabled` tied to `timeRemaining` — a local state variable. This is simpler to express by calling `renderDialogButton` directly for that slot, putting the computed `disabled` in the defaults:

```tsx
{renderDialogActions(
  [
    {
      button: props.actions?.cancelButton,
      defaults: { label: 'Cancel', variant: 'outline', onClick: (a) => a.dismiss('cancel') },
      key: 'cancel',
    },
    {
      button: props.actions?.confirmButton,
      defaults: {
        label: timeRemaining > 0 ? `Confirm (${timeRemaining}s)` : 'Confirm',
        variant: 'default',
        disabled: timeRemaining > 0 && !props.autoConfirm,
        onClick: (a) => a.confirm('confirm pressed'),
      },
      key: 'confirm',
    },
  ],
  props,
  undefined,
)}
```

Alternatively, pass `timeRemaining` as context so users who override `confirmButton` with a callback also get it:

```tsx
const ctx = { timeRemaining, autoConfirm: props.autoConfirm };
// TCtx = { timeRemaining: number; autoConfirm: boolean }
```

---

## Positioning — inserting between existing slots

Slot render order = the order of items in the array passed to `renderDialogActions`, or the `[cancel, custom..., confirm]` order of `renderStandardDialogActions`.

Users **cannot reorder slots** — only hide or reconfigure them. To provide a user-facing insertion point, the dialog exposes a named slot that defaults to hidden:

```ts
// Dialog exposes a "middle" slot between cancel and confirm
export interface MyDialogActionsConfig {
  cancelButton?: DialogActionButton<T>;
  middleButton?: DialogActionButton<T>;   // defaults false (hidden)
  confirmButton?: DialogActionButton<T>;
}

// In the dialog's renderActions:
const slots = [
  { button: config?.cancelButton, defaults: cancelDefaults, key: 'cancel' },
  {
    button: config?.middleButton ?? false,  // hidden unless user provides one
    defaults: { label: '', variant: 'secondary', onClick: () => {} },
    key: 'middle',
  },
  { button: config?.confirmButton, defaults: confirmDefaults, key: 'confirm' },
];
renderDialogActions(slots, dialogActions, ctx);
```

For full reordering or completely custom layouts, the `container` render function is the escape hatch.

---

## Note: `GenerateDialogTypes<TProps, TValue, TCtx>` utility type

When authoring a custom dialog, several related types must be written manually:
- Component props: `MyProps & DialogActions<TValue>` (= `DialogComponentProps<MyProps, TValue>`)
- Hook return: `DialogActions<TValue> & { props: MyProps }` (what `useDynamicDialog<MyProps, TValue>()` returns)
- Dialog result: `DialogResultData<TValue>` (what `.then()` receives)

A utility type could generate all from one declaration:

```ts
type G = GenerateDialogTypes<MyProps, MyValue, MyContext>;
// G['componentProps'] = MyProps & DialogActions<MyValue>
// G['hookReturn']     = DialogActions<MyValue> & { props: MyProps }
// G['result']         = DialogResultData<MyValue>

function MyDialog(props: G['componentProps']) { ... }
const { confirm, props } = useDynamicDialog<G>(); // hypothetical overload
```

**Deferred**: not yet implemented. Needs design for how `useDynamicDialog` overloads would consume the generated type object.

---

## Open questions

- **`customButtons` and `true`**: Passing `true` to a custom button slot produces a button with empty label and no-op onClick (the placeholder defaults). Should `true` be excluded from the type of `customButtons` array elements? One option: a `DialogActionButtonWithoutDefaults<T, TCtx>` subtype that excludes `true` and bare `string`.

- **`label` as a callback**: Adding `label?: ReactNode | ((actions, ctx) => ReactNode)` to the descriptor would close the "dynamic label without a full callback" gap neatly. Currently dynamic labels require the callback form at the union level. Worth adding once the core implementation is stable.

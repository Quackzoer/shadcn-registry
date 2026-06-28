# DialogActionButton — Design Document

## Motivation

The current `confirm-dialog.tsx` has several structural problems:

**1. Redundant show/hide controls.**  
`showCancel?: boolean` and `cancelButton?` are separate. `cancelButton: undefined` does NOT hide the button — you also need `showCancel: false`. Two props doing one job.

**2. `renderAction` is a private implementation detail.**  
Lives only inside `confirm-dialog.tsx`. `CountdownDialog` and `DelayedActionDialog` hardcode their own button HTML, causing layout/spacing divergence.

**3. The descriptor type is too narrow.**  
The current `{ label: string, onClick: ... }` object form doesn't allow `variant`, `size`, `className`, `disabled`, `form`, etc. Callers must fall back to a full render function for anything visual.

**4. No way to pass component state into button logic.**  
`TypeToConfirmDialog` needs form validity to control the confirm button's `disabled` state, but there's no channel for that through the current API.

**5. No canonical slot system.**  
Adding a new button between cancel and confirm, or creating a reusable dialog with a custom action slot, has no clean pattern.

---

## Goals

- `cancelButton?: DialogActionButton<T>` — presence/value controls both show and configuration. No separate `show` flag.
- The descriptor form passes through **all `Button` component props**.
- Context props flow into `disabled` and `onClick` — so form state, loading state, etc. can affect buttons without wrapping in a render function.
- `renderDialogActions` and `renderDialogButton` become exported primitives, shared across all built-in dialogs.
- **Each dialog defines its own actions shape** — there is no shared `DialogActionsConfig` interface with fixed `cancelButton`/`confirmButton` fields. Dialogs that don't have a confirm button simply don't include it in their actions type.

---

## Type: `DialogActionButton<T, TCtx = void>`

A single button in a dialog's action area. The second type parameter `TCtx` carries context that flows into `disabled` and `onClick`.

```ts
type DialogActionButton<T, TCtx = void> =
  | true                                                      // show with all slot defaults
  | false                                                     // explicitly hide
  | string                                                    // custom label, all other defaults
  | DialogActionButtonDescriptor<T, TCtx>                     // full object config
  | ((actions: DialogActions<T>, ctx: TCtx) => ReactNode)    // render function: full control
  | ReactNode;                                                // static JSX: no dialog/context access
```

`undefined` (prop omitted) and `false` both mean "don't render". Everything else means "render, configured this way".

### Variant decision guide

| You want to... | Use |
|---|---|
| Show with all defaults | `true` |
| Suppress explicitly | `false` |
| Change only the label | `"My label"` |
| Change label + variant/size/className | `{ label: 'Save', variant: 'default', size: 'sm' }` |
| Change only variant, keep default label | `{ variant: 'ghost' }` |
| Custom action on click | `{ onClick: (a) => a.dismiss('snoozed') }` |
| Disable based on context (form state, etc.) | `{ disabled: (_, ctx) => !ctx.isFormValid }` |
| Disable based on dialog state | `{ disabled: (a) => !a.open }` |
| Fully dynamic content, access to local state | `(actions, ctx) => <MyButton />` |
| Static custom element | `<a href="/help">Help</a>` |

### Why `true` is in the union

Without `true`, "show with defaults" requires omitting the prop — but omitting means don't show (contradiction) — or passing `{}` (confusing). `true` is the unambiguous "show exactly as the dialog designed this slot". Symmetric counterpart to `false`.

### Why `false` is in the union

For programmatic boolean-driven scenarios:
```ts
confirmButton={isDangerous ? { label: 'Delete Forever', variant: 'destructive' } : false}
```

### Why render function receives `ctx`

The render function escape hatch should always have access to the same context that `disabled`/`onClick` on the descriptor get. Consistent signature: `(actions, ctx) => ReactNode`.

### Why `ReactNode` is the fallback

For static elements that don't need dialog state — a badge, a link, an icon — passing JSX directly avoids an unnecessary function wrapper.

---

## Type: `DialogActionButtonDescriptor<T, TCtx = void>`

The object form. Extends all `Button` component props, replacing `children`, `onClick`, and `disabled` with dialog-aware + context-aware versions:

```ts
type DialogActionButtonDescriptor<T, TCtx = void> =
  Omit<React.ComponentProps<typeof Button>, 'onClick' | 'disabled' | 'children'> & {
    /**
     * Button text/content. Replaces `children`.
     * Optional — falls back to the slot's default label, so you can change
     * variant without repeating the label:
     *   cancelButton={{ variant: 'ghost' }}  →  still shows "Cancel"
     */
    label?: ReactNode;

    /**
     * Called with dialog methods and context when clicked.
     * Optional — falls back to the slot's default action:
     *   cancelButton={{ className: 'w-full' }}  →  still calls dismiss('cancel')
     */
    onClick?: (actions: DialogActions<T>, ctx: TCtx) => void;

    /**
     * Static boolean, or a function receiving dialog methods + context.
     * Use the function form when disabled state comes from context (form validity,
     * loading state, etc.). For local component state, use the render function variant.
     */
    disabled?: boolean | ((actions: DialogActions<T>, ctx: TCtx) => boolean);
  };
```

Extending `React.ComponentProps<typeof Button>` gives `variant`, `size`, `className`, `asChild`, `type`, `form`, `aria-*`, and anything else `Button` accepts — without the library forward-declaring each one.

### Key examples

```ts
// Change only the variant — inherits default label and onClick
cancelButton={{ variant: 'ghost' }}

// Custom label, custom variant, keep default onClick
cancelButton={{ label: 'Go back', variant: 'outline', size: 'sm' }}

// Submit a form by ID (no onClick needed — native form submit handles it)
confirmButton={{ type: 'submit', form: 'my-form', label: 'Save changes' }}

// Disabled from context — typeToConfirmDialog passes { isValid } as context
confirmButton={{ disabled: (_, ctx) => !ctx.isValid }}

// Disabled from dialog state
confirmButton={{ disabled: (a) => !a.open }}

// Full width
cancelButton={{ className: 'w-full sm:w-auto' }}

// Dynamic label based on context (e.g. countdown)
confirmButton={{ label: (/* no access here */) => ... }}
// For dynamic label: use render function instead:
confirmButton={(actions, ctx) => (
  <Button disabled={ctx.timeRemaining > 0}>
    {ctx.timeRemaining > 0 ? `Wait (${ctx.timeRemaining}s)` : 'Confirm'}
  </Button>
)}
```

---

## Dialog-specific actions shapes — NOT a shared interface

**`DialogActionsConfig<T>` as a shared interface with `cancelButton`/`confirmButton` fields is the wrong abstraction.** 

Different dialogs have entirely different action semantics:
- `confirmDialog` → cancel + confirm
- `countdownDialog` → cancel only (confirm timing is internal)
- `typeToConfirmDialog` → cancel + a form-submit confirm (with form state context)
- `loadingDialog` → no user-facing buttons at all (or just a cancel when `allowCancel: true`)
- A custom `SnoozeReminderDialog` might have → cancel + snooze + confirm

Forcing all of these through a shared `{ cancelButton?, confirmButton?, customButtons? }` interface would mean:
- Dialogs without a confirm button receive a `confirmButton` prop that does nothing or must be documented as "don't use"
- Dialogs with additional semantic slots (snooze, skip, retry) can't name them
- The dialog author loses the ability to document what each slot means

**Instead: each dialog defines its own `ActionsConfig` using `DialogActionButton<T, TCtx>` directly:**

```ts
// confirmDialog
interface ConfirmDialogActionsConfig {
  cancelButton?: DialogActionButton<boolean | undefined>;
  confirmButton?: DialogActionButton<boolean | undefined>;
  container?: DialogActionsContainer<boolean | undefined>;
}

// countdownDialog — only exposes cancel; confirm timing is internal
interface CountdownDialogActionsConfig {
  cancelButton?: DialogActionButton<string>;
}

// typeToConfirmDialog — confirm disabled state depends on form validity
interface TypeToConfirmDialogActionsConfig {
  cancelButton?: DialogActionButton<{ itemName: string }, { isValid: boolean }>;
  confirmButton?: DialogActionButton<{ itemName: string }, { isValid: boolean }>;
}

// A custom snooze dialog with three slots
interface SnoozeDialogActionsConfig {
  dismissButton?: DialogActionButton<SnoozeResult>;
  snoozeButton?: DialogActionButton<SnoozeResult>;
  confirmButton?: DialogActionButton<SnoozeResult>;
  container?: DialogActionsContainer<SnoozeResult>;
}
```

Each slot name is meaningful, documented, and typed correctly for its own TCtx.

---

## `renderDialogActions<T, TCtx>` — the shared renderer

The shared primitive that all built-in dialogs use internally. It accepts a **named slot map** in render order and a context object.

```ts
// Slot map — keys are slot names, values are the resolved button definitions.
// Key insertion order determines left-to-right render order.
type DialogActionsSlotMap<T, TCtx> = Record<
  string,
  DialogActionButton<T, TCtx> | DialogActionButton<T, TCtx>[] | undefined
>;

function renderDialogActions<T, TCtx = void>(
  slots: DialogActionsSlotMap<T, TCtx>,
  context: TCtx,
  dialogActions: DialogActions<T>,
  container?: DialogActionsContainer<T, TCtx>,
): ReactNode
```

Array values in the slot map render each element consecutively in position — useful for grouped or repeated slots.

### How a dialog uses this

The dialog:
1. Defines its default slot map (with all defaults filled in as `DialogActionButtonDescriptor` values)
2. Merges the user-provided overrides on top using `resolveDialogActions`
3. Calls `renderDialogActions` with the merged map, context, and dialog methods

```tsx
// confirmDialog internal rendering
const slots = resolveDialogActions(props.actions, {
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
});

{renderDialogActions(slots, undefined, props, props.actions?.container)}
```

```tsx
// typeToConfirmDialog internal rendering — passes form state as context
const slots = resolveDialogActions(props.actions, {
  cancel: {
    label: 'Cancel',
    variant: 'outline',
    onClick: (a) => a.dismiss('cancel'),
  },
  confirm: {
    label: 'Delete Forever',
    variant: 'destructive',
    type: 'submit',
    form: 'type-to-confirm-form',
    disabled: (_, ctx) => !ctx.isValid,
  },
});

{renderDialogActions(
  slots,
  { isValid: form.formState.isValid },  // context from component state
  props,
)}
```

```tsx
// snoozeDialog — three named slots, user can override any
const slots = resolveDialogActions(props.actions, {
  dismiss: {
    label: 'Dismiss',
    variant: 'ghost',
    onClick: (a) => a.dismiss('cancel'),
  },
  snooze: {
    label: 'Snooze 10 min',
    variant: 'outline',
    onClick: (a) => a.confirm({ snoozed: true, minutes: 10 }),
  },
  confirm: {
    label: 'Mark done',
    variant: 'default',
    onClick: (a) => a.confirm({ snoozed: false }),
  },
});

{renderDialogActions(slots, undefined, props)}
```

---

## `resolveDialogActions<T, TCtx>` — merging defaults with user overrides

The dialog calls this before `renderDialogActions` to produce the final slot map.

```ts
function resolveDialogActions<T, TCtx>(
  userActions: Record<string, DialogActionButton<T, TCtx> | undefined> | undefined,
  defaults: Record<string, DialogActionButtonDescriptor<T, TCtx>>,
): DialogActionsSlotMap<T, TCtx>
```

**Merge semantics per slot:**

| User provides | Result |
|---|---|
| Nothing (slot not in `userActions`) | Render with `defaults[slot]` |
| `true` | Render with `defaults[slot]` |
| `false` or `undefined` | Don't render |
| `string` | Render with custom label, rest from `defaults[slot]` |
| descriptor | Render with descriptor merged on top of `defaults[slot]` (descriptor wins per field) |
| function | Call function (defaults ignored — user has full control) |
| `ReactNode` | Render directly (defaults ignored) |

**Key property**: `defaults` determines the available slot names AND their render order (insertion order). User overrides can only hide or modify existing slots — they cannot add new named slots or change order. For entirely custom layouts, the `container` render function is the right tool.

---

## Positioning / Inserting Between Existing Slots

The render order of named slots follows the **insertion order of the `defaults` map** that the dialog passes to `resolveDialogActions`. Users cannot reorder slots — they can only override slot content or hide slots.

**To provide a user-facing insertion point between two existing slots**, the dialog explicitly names a slot for it:

```ts
// Dialog exposes a "between" slot
interface ConfirmDialogActionsConfig {
  cancelButton?: DialogActionButton<boolean | undefined>;
  middleButton?: DialogActionButton<boolean | undefined>;   // between cancel and confirm
  confirmButton?: DialogActionButton<boolean | undefined>;
}

// Dialog's defaults — middleButton defaults to false (hidden)
const defaults = {
  cancel: { label: 'Cancel', ... },
  middle: false,                  // hidden by default — user opts in
  confirm: { label: 'Confirm', ... },
};
```

User then does:
```ts
confirmDialog({
  props: {
    actions: {
      middleButton: { label: 'Save as draft', variant: 'secondary', onClick: ... }
    }
  }
})
```

For fully custom orderings (e.g. putting confirm first), the `container` render function is the escape hatch:
```ts
container: (children) => <div className="flex flex-row-reverse gap-3">{children}</div>
```

---

## `renderDialogButton<T, TCtx>` — single-slot primitive

Exported for dialogs that need per-slot control (e.g., countdown needs `disabled` tied to component state that can't be expressed in context).

```ts
interface DialogActionButtonSlotDefaults<T, TCtx = void> {
  label: ReactNode;
  variant: React.ComponentProps<typeof Button>['variant'];
  onClick: (actions: DialogActions<T>, ctx: TCtx) => void;
  type?: React.ComponentProps<typeof Button>['type'];
}

function renderDialogButton<T, TCtx = void>(
  button: DialogActionButton<T, TCtx> | undefined,
  dialogActions: DialogActions<T>,
  context: TCtx,
  defaults: DialogActionButtonSlotDefaults<T, TCtx>,
): ReactNode
```

### Resolution order

```
undefined | false | null  → null
function                  → button(dialogActions, context)
true                      → <Button ...defaults />
string                    → <Button ...defaults label={string} />
React.isValidElement      → rendered as-is
Array                     → rendered as-is (ReactNode)
non-object primitive      → rendered as-is (number, etc.)
plain object (descriptor) → <Button merged(descriptor, defaults) />
```

### Descriptor merge detail

```ts
const { label, onClick, disabled, ...buttonProps } = descriptor;

<Button
  type={buttonProps.type ?? defaults.type ?? 'button'}
  variant={buttonProps.variant ?? defaults.variant}
  disabled={typeof disabled === 'function' ? disabled(dialogActions, context) : disabled}
  onClick={() => (onClick ?? defaults.onClick)(dialogActions, context)}
  {...buttonProps}
>
  {label ?? defaults.label}
</Button>
```

The spread order means any explicit `buttonProps` override `defaults` for non-special fields.

---

## `DialogActionsContainer<T, TCtx = void>`

Controls the wrapper element around all rendered buttons:

```ts
type DialogActionsContainer<T, TCtx = void> =
  | React.ComponentProps<'div'>
  | ((children: ReactNode, dialogActions: DialogActions<T>, ctx: TCtx) => ReactNode);
```

**Div props form**: `className` merges with defaults (`flex justify-end gap-3 pt-2`). Other props are passed through.

```ts
container: { className: 'flex-col-reverse sm:flex-row sm:justify-end' }
container: { 'data-testid': 'dialog-footer' }
```

**Render function form**: receives rendered buttons + dialog methods + context. The full escape hatch.

```ts
container: (children, actions, ctx) => (
  <RequiresPermission permission="admin" fallback={<p>No permission</p>}>
    {children}
  </RequiresPermission>
)
```

---

## Discrimination at runtime

`DialogActionButton<T, TCtx>` requires runtime narrowing because `ReactNode` and `DialogActionButtonDescriptor` are both objects. The discriminator used in `renderDialogButton`:

```ts
function isDescriptor<T, TCtx>(value: unknown): value is DialogActionButtonDescriptor<T, TCtx> {
  return (
    value !== null &&
    typeof value === 'object' &&
    !React.isValidElement(value) &&
    !Array.isArray(value)
  );
}
```

Any plain object that is not a React element and not an array is treated as a descriptor. TypeScript enforces correct shapes at the call site — the runtime guard only handles the React element / descriptor boundary.

---

## Note: `GenerateDialogTypes<TProps, TValue, TCtx>` utility type

When authoring a custom dialog, the user currently needs to write several related types manually:
- Component props: `DialogComponentProps<MyProps, MyValue>` (i.e. `MyProps & DialogActions<MyValue>`)
- Hook return: `DialogActions<MyValue> & { props: MyProps }` when using `useDynamicDialog`
- Dialog result: `DialogResultData<MyValue>` for the `.then()` callback

A utility type could generate these from one declaration:

```ts
type G = GenerateDialogTypes<MyProps, MyValue, MyContext>;

// G['componentProps'] = MyProps & DialogActions<MyValue>
// G['hookReturn']     = DialogActions<MyValue> & { props: MyProps }
// G['result']         = DialogResultData<MyValue>
```

Usage in a custom dialog:

```ts
interface MyDialogProps { title: string; items: string[] }
type G = GenerateDialogTypes<MyDialogProps, boolean>;

// Instead of:
function MyDialog(props: DialogComponentProps<MyDialogProps, boolean>) { ... }
// Write:
function MyDialog(props: G['componentProps']) { ... }

// Instead of:
const { confirm, dismiss, props } = useDynamicDialog<MyDialogProps, boolean>();
// Could use:
const { confirm, dismiss, props } = useDynamicDialog<G>();
```

**Deferred**: not implemented yet. Needs design for how `useDynamicDialog` overloads would consume the generated type.

---

## Open questions

- **`customButtons` slot in positional arrays**: Should `renderDialogActions` treat array-valued slots specially (render each in sequence) vs. always requiring named slots? Arrays break the "each slot is named" model but are needed for `customButtons?: DialogActionButton<T>[]`.

- **Descriptor `label` being a function**: Should `label` accept `(actions, ctx) => ReactNode` for dynamic labels (like the countdown's "Confirm (3s)")? Currently only the render function variant supports dynamic labels. Adding `label?: ReactNode | ((a, ctx) => ReactNode)` would close this gap cleanly.

- **`resolveDialogActions` type**: Currently typed as `Record<string, ...>`. In practice each dialog knows its exact slot names — the result type could be `{ [K in keyof Defaults]: DialogActionButton<T, TCtx> }` (preserving slot names). Worth typing precisely when implementing.

- **`confirmDefaults.disabled` for time-based dialogs**: Countdown/delayed-action need `disabled` tied to `timeRemaining` (component state). Three options: (a) pass `timeRemaining` in context, (b) use `renderDialogButton` for that slot directly, (c) add `defaultDisabled` to `DialogActionButtonSlotDefaults`. Option (a) is cleanest if the context type is designed upfront.

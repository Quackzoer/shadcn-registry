# DialogActionButton — Design Document

## Motivation

The current `confirm-dialog.tsx` has several structural problems in how it handles action buttons:

**1. Redundant show/hide controls.**  
`showCancel?: boolean` and `cancelButton?` are separate. Passing `cancelButton: undefined` does NOT hide the button — you also need `showCancel: false`. Two props doing one job.

**2. `renderAction` is a private implementation detail.**  
The `renderAction` function lives inside `confirm-dialog.tsx` and is not available to other dialogs. `CountdownDialog` and `DelayedActionDialog` each hardcode their own button HTML — they can't reuse the same rendering logic, leading to divergence in layout, spacing, and prop handling.

**3. The descriptor type is too narrow.**  
The current `{ label: string, onClick: ... }` object form doesn't allow passing button-level props like `variant`, `size`, `className`, `disabled`, or `form`. Callers who want anything beyond label + click must fall back to a full render function.

**4. Custom buttons lack a default action.**  
`customButtons` receives `() => {}` as its `defaultOnClick`, making string-only custom buttons silent no-ops.

---

## Goals

- `cancelButton?: DialogActionButton<T>` — presence/value controls both show and configuration. No separate `show` flag needed.
- The object descriptor form passes through **all `Button` component props**, so callers never need a full render function just to change `variant` or `size`.
- `renderDialogButton` and `renderDialogActions` become exported primitives, shared across all built-in dialogs.
- An `actions?.container` prop controls the wrapper element around buttons without breaking the type contract.

---

## Type: `DialogActionButton<T>`

A single button in a dialog's action area. Each variant answers "what should this button look like and do?":

```ts
type DialogActionButton<T> =
  | true                                           // show with all slot defaults
  | false                                          // explicitly hide
  | string                                         // custom label, all other defaults unchanged
  | DialogActionButtonDescriptor<T>                // object: any Button prop + dialog-aware onClick/disabled
  | ((actions: DialogActions<T>) => ReactNode)     // render function: full control, receives dialog methods
  | ReactNode;                                     // static JSX: no dialog state access
```

`undefined` (prop omitted) and `false` both mean "don't render". Everything else means "render, configured this way".

### Variant decision guide

| You want to... | Use |
|---|---|
| Show with all defaults | `true` |
| Suppress (explicit) | `false` |
| Change only the label | `"My label"` |
| Change label + variant/size/className | `{ label: 'My label', variant: 'secondary' }` |
| Change only variant, keep default label | `{ variant: 'secondary' }` |
| Call a custom action on click | `{ onClick: (a) => a.dismiss('cancel') }` |
| Disable based on dialog state | `{ disabled: (a) => !a.open }` |
| Conditionally disable via local state | `(actions) => <MyButton actions={actions} />` |
| Completely custom (tooltip, link, etc.) | `(actions) => <Tooltip>...</Tooltip>` or static JSX |
| Static custom element | `<a href="/help">Help</a>` |

### Why `true` is in the union

Without `true`, "show with defaults" requires either omitting the prop (which means don't show — contradiction) or passing an empty object `{}`. `true` is the unambiguous signal: "show this slot exactly as the dialog designed it". It's the symmetric counterpart to `false`.

### Why `false` is in the union

For programmatic boolean-driven scenarios:
```ts
confirmButton={isDangerous ? { label: 'Delete Forever', variant: 'destructive' } : false}
```
This avoids ternaries that return `undefined` (which TypeScript sometimes complains about in JSX).

### Why `ReactNode` is the fallback

The render function `(actions) => ReactNode` covers all cases where you need dialog state. For cases where you don't — a static badge, a link, a custom element — passing `ReactNode` directly avoids wrapping it in an unnecessary function.

---

## Type: `DialogActionButtonDescriptor<T>`

The object configuration form. Extends all `Button` component props, replacing `children`, `onClick`, and `disabled` with dialog-aware versions:

```ts
type DialogActionButtonDescriptor<T> =
  Omit<React.ComponentProps<typeof Button>, 'onClick' | 'disabled' | 'children'> & {
    /**
     * Button label. Replaces `children`.
     * Optional — if omitted, falls back to the slot's default label (e.g. "Cancel" or "Confirm").
     * This lets you change only the variant without repeating the label:
     *   cancelButton={{ variant: 'ghost' }}  →  still shows "Cancel"
     */
    label?: ReactNode;

    /**
     * Called with dialog control methods when the button is clicked.
     * Optional — if omitted, falls back to the slot's default action
     * (dismiss('cancel') for the cancel slot, confirm(value) for the confirm slot).
     * This lets you change styling without reimplementing the action:
     *   cancelButton={{ className: 'w-full' }}  →  still calls dismiss('cancel')
     */
    onClick?: (actions: DialogActions<T>) => void;

    /**
     * Boolean or function of dialog state.
     * Use boolean for static disabled state.
     * Use function for disabled state derived from dialog actions (e.g., open state).
     * For disabled state derived from local component state, use the render function variant instead.
     */
    disabled?: boolean | ((actions: DialogActions<T>) => boolean);
  };
```

Extending `React.ComponentProps<typeof Button>` means the descriptor inherits `variant`, `size`, `className`, `asChild`, `type`, `form`, `aria-*`, and every other prop the Button accepts — without the library needing to explicitly forward any of them.

### Examples

```ts
// Change only the variant — inherits default label and onClick
cancelButton={{ variant: 'ghost' }}

// Custom label, custom variant, keep default onClick  
cancelButton={{ label: 'Go back', variant: 'outline', size: 'sm' }}

// Custom label, custom action, custom variant
confirmButton={{ label: 'Yes, delete', variant: 'destructive', onClick: (a) => a.confirm(true) }}

// Disabled until form is valid — note: for local state use render function instead
confirmButton={{ disabled: true }}

// Submit a form by ID instead of using onClick
confirmButton={{ type: 'submit', form: 'my-form', label: 'Save' }}

// Full width button
cancelButton={{ className: 'w-full', label: 'Cancel' }}
```

---

## Type: `DialogActionsConfig<T>`

Groups all button slots for a dialog's action area, replacing the current `DialogActionButtons<T>`:

```ts
interface DialogActionsConfig<T> {
  /**
   * Renders before cancelButton and confirmButton (leftmost).
   * Each element follows the same DialogActionButton<T> contract.
   * For custom buttons, there is no default onClick — callers must provide one
   * via the descriptor's onClick, a render function, or direct JSX.
   */
  customButtons?: DialogActionButton<T>[];

  /**
   * The cancel/dismiss slot. Undefined or false = don't show.
   * Default action: dismiss('cancel').
   */
  cancelButton?: DialogActionButton<T>;

  /**
   * The confirm/primary-action slot. Undefined or false = don't show.
   * Default action: the dialog's confirm() call (varies per dialog).
   */
  confirmButton?: DialogActionButton<T>;

  /**
   * Controls the wrapper element around all rendered buttons.
   * See DialogActionsContainer<T>.
   */
  container?: DialogActionsContainer<T>;
}
```

### Migration from `DialogActionButtons<T>`

| Old | New |
|---|---|
| `{ showCancel: false }` | `{ cancelButton: false }` |
| `{ showCancel: true }` (default) | omit `cancelButton`, or `{ cancelButton: true }` |
| `{ cancelButton: 'Go back' }` | `{ cancelButton: 'Go back' }` (unchanged) |
| `{ cancelButton: { label: '...', onClick: ... } }` | `{ cancelButton: { label: '...', onClick: ... } }` (unchanged) |
| `{ showConfirm: false }` | `{ confirmButton: false }` |
| `{ customButtons: [...] }` | `{ customButtons: [...] }` (unchanged) |

---

## Type: `DialogActionsContainer<T>`

Controls the wrapper element that groups the rendered buttons:

```ts
type DialogActionsContainer<T> =
  | React.ComponentProps<'div'>
  | ((children: ReactNode, actions: DialogActions<T>) => ReactNode);
```

**Div props form**: `className` is merged (not replaced) with the default layout classes (`flex justify-end gap-3 pt-2`). All other div props override directly.

```ts
// Expand to full width, stack vertically on mobile
container: { className: 'flex-col-reverse sm:flex-row sm:justify-end' }

// Add a data attribute
container: { 'data-testid': 'dialog-actions' }
```

**Render function form**: receives already-rendered button nodes + dialog actions. Use for completely custom layouts or wrapping buttons in non-div elements:

```ts
// Grid layout
container: (children) => (
  <div className="grid grid-cols-2 gap-2 w-full">{children}</div>
)

// Permission gate around the action area
container: (children, actions) => (
  <RequiresPermission permission="admin" fallback={null}>
    {children}
  </RequiresPermission>
)
```

---

## `DialogActionButtonSlotDefaults<T>`

Each button slot in a dialog has a set of defaults — what to render when the button value is `true`, or when the descriptor omits `label` / `onClick`:

```ts
interface DialogActionButtonSlotDefaults<T> {
  /** Label shown when button is true or descriptor omits label. */
  label: ReactNode;
  /** Variant applied when button is true or descriptor omits variant. */
  variant: React.ComponentProps<typeof Button>['variant'];
  /** Action called when button is true, a string, or descriptor omits onClick. */
  onClick: (actions: DialogActions<T>) => void;
  /** Default type attribute. Typically 'button' for cancel, 'submit' for confirm. */
  type?: React.ComponentProps<typeof Button>['type'];
}
```

Dialogs provide these when calling `renderDialogActions`. They encode the semantic meaning of each slot for that dialog.

---

## `renderDialogButton<T>` — exported primitive

Renders a single `DialogActionButton<T>` value. Exported from the shared actions module so dialogs can use individual slots when they need finer control than `renderDialogActions` provides.

```ts
function renderDialogButton<T>(
  button: DialogActionButton<T> | undefined,
  actions: DialogActions<T>,
  defaults: DialogActionButtonSlotDefaults<T>,
): ReactNode
```

### Resolution order

```
undefined | false | null → null (don't render)
function              → button(actions)
true                  → <Button variant={defaults.variant} type={defaults.type} onClick={() => defaults.onClick(actions)}>{defaults.label}</Button>
string                → <Button variant={defaults.variant} type={defaults.type} onClick={() => defaults.onClick(actions)}>{string}</Button>
React.isValidElement  → button as-is (ReactNode)
Array                 → button as-is (ReactNode)
typeof !== 'object'   → button as-is (number, etc.)
object (descriptor)   → <Button {...descriptorProps} variant={descriptor.variant ?? defaults.variant} ... />
```

### Descriptor resolution detail

```ts
// When button is a DialogActionButtonDescriptor<T>:
const { label, onClick, disabled, ...buttonProps } = button;

<Button
  type={buttonProps.type ?? defaults.type ?? 'button'}
  variant={buttonProps.variant ?? defaults.variant}
  disabled={typeof disabled === 'function' ? disabled(actions) : disabled}
  onClick={() => (onClick ?? defaults.onClick)(actions)}
  {...buttonProps}  // remaining props: size, className, asChild, form, aria-*, etc.
>
  {label ?? defaults.label}
</Button>
```

---

## `renderDialogActions<T>` — exported public API

Renders the full action area — all button slots in order + the container wrapper. This is the primary export intended for use in all built-in dialogs.

```ts
interface RenderDialogActionsOptions<T> {
  /** User-supplied button configuration. Undefined = render all slots with defaults. */
  buttons: DialogActionsConfig<T> | undefined;
  /** Dialog control methods (confirm, dismiss, open, onOpenChange). */
  actions: DialogActions<T>;
  /** Defaults for the cancel slot. */
  cancelDefaults: DialogActionButtonSlotDefaults<T>;
  /** Defaults for the confirm slot. */
  confirmDefaults: DialogActionButtonSlotDefaults<T>;
}

function renderDialogActions<T>(options: RenderDialogActionsOptions<T>): ReactNode
```

### Default behavior when `buttons` is undefined

When the user doesn't pass `actions` to the dialog, `renderDialogActions` renders both cancel and confirm slots with their full defaults. This means dialogs "just work" with no configuration:
- `confirmDialog()` shows "Cancel" + "Confirm" out of the box.

### Render order

```
[customButtons[0], customButtons[1], ...] [cancelButton] [confirmButton]
```

Left-to-right, primary action always rightmost. This matches conventional modal layouts.

### Container rendering

```ts
// When container is undefined or div props:
<div className={cn('flex justify-end gap-3 pt-2', container?.className)} ...rest>
  {buttons}
</div>

// When container is a render function:
container(buttons, actions)
```

---

## Usage across dialogs

### `confirmDialog`

```tsx
{renderDialogActions({
  buttons: props.actions,
  actions: props,
  cancelDefaults: {
    label: 'Cancel',
    variant: 'outline',
    onClick: (a) => a.dismiss('cancel'),
    type: 'button',
  },
  confirmDefaults: {
    label: 'Confirm',
    variant: 'destructive',
    onClick: (a) => a.confirm(true),
    type: 'submit',
  },
})}
```

### `countdownDialog`

The countdown dialog has a time-dependent disabled state on the confirm button, so it uses `renderDialogButton` for the confirm slot directly:

```tsx
<div className="flex justify-end gap-3 pt-2">
  {renderDialogButton(
    props.actions?.cancelButton,
    props,
    { label: 'Cancel', variant: 'outline', onClick: (a) => a.dismiss('cancel'), type: 'button' }
  )}
  <Button
    onClick={() => props.confirm('confirm pressed')}
    disabled={timeRemaining > 0 && !props.autoConfirm}
  >
    {timeRemaining > 0 && !props.autoConfirm ? `Confirm (${timeRemaining}s)` : 'Confirm'}
  </Button>
</div>
```

Or, if the disabled/label logic is provided as defaults with a closure over component state:

```tsx
{renderDialogActions({
  buttons: props.actions,
  actions: props,
  cancelDefaults: { label: 'Cancel', variant: 'outline', onClick: (a) => a.dismiss('cancel') },
  confirmDefaults: {
    label: timeRemaining > 0 ? `Confirm (${timeRemaining}s)` : 'Confirm',
    variant: 'default',
    onClick: (a) => a.confirm('confirm pressed'),
    // disabled is part of the descriptor — pass it as a default override via buttons prop
    // or handle inline as above
  },
})}
```

### `delayedActionDialog`

```tsx
{renderDialogActions({
  buttons: props.actions,
  actions: props,
  cancelDefaults: { label: 'Cancel', variant: 'outline', onClick: (a) => a.dismiss('cancel') },
  confirmDefaults: {
    label: canInteract ? 'Continue' : `Please wait (${timeRemaining}s)`,
    variant: props.dangerAction ? 'destructive' : 'default',
    onClick: (a) => a.confirm(true),
  },
})}
```

---

## Discrimination at runtime

The union `DialogActionButton<T>` requires runtime type narrowing because `ReactNode` and `DialogActionButtonDescriptor<T>` are both objects. The discrimination guard used in `renderDialogButton`:

```ts
function isDescriptor<T>(value: unknown): value is DialogActionButtonDescriptor<T> {
  return (
    value !== null &&
    typeof value === 'object' &&
    !React.isValidElement(value) &&
    !Array.isArray(value)
  );
}
```

Any plain object that isn't a React element and isn't an array is treated as a descriptor. TypeScript enforces at the call site that only valid shapes are passed — the runtime guard just handles the JSX element / descriptor ambiguity.

This is more permissive than the current `isButtonDescriptor` (which required `label` and `onClick`). Since `label` is now optional in the descriptor, we can't use it as a discriminator.

---

## Open questions / deferred decisions

- **`customButtons` default action**: Currently no meaningful default exists (the old code passed `() => {}`). Should custom buttons require an `onClick`? One option: make `customButtons` only accept `DialogActionButtonDescriptor<T>` (with `onClick` required), render function, or `ReactNode` — excluding `true`, `false`, and `string` which have no semantic meaning without a slot-defined default.

- **Button ordering**: The render order is fixed (custom → cancel → confirm). Should `container` support re-ordering, or is a render function sufficient for that?

- **`confirmDefaults.disabled`**: Time-dependent disabled state (countdown, delayed-action) can't be expressed in `DialogActionButtonSlotDefaults<T>` because it closes over component state. Pattern: pass the confirm button via `props.actions?.confirmButton` and fall back to a hardcoded button when component state needs to control `disabled`. Or add a `defaultDisabled` field to `DialogActionButtonSlotDefaults`.

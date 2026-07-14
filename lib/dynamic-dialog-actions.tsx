"use client"

import React, { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/ui/button";
import type { DialogActions } from "@/lib/dynamic-dialog-state";

// ─── Descriptor ───────────────────────────────────────────────────────────────
//
// The static object form of a button definition. Extends all Button props so
// callers get full visual control (variant, size, className, form, asChild…)
// without needing a render function just to change a single prop.
//
// label and onClick are optional: omitting either falls back to the slot's
// defaults, so `cancelButton={{ variant: 'ghost' }}` still shows "Cancel" and
// still calls dismiss('cancel').
//
// disabled is always a static boolean here. For disabled state that depends on
// context (form validity, countdown, etc.) use the callback variant of
// DialogActionButton which returns the full descriptor after consulting state.

export type DialogActionButtonDescriptor<T, TCtx = undefined> =
  Omit<React.ComponentProps<typeof Button>, "onClick" | "disabled" | "children"> & {
    label?: ReactNode;
    onClick?: (actions: DialogActions<T>, ctx: TCtx) => void;
    disabled?: boolean;
  };

// ─── Slot defaults ────────────────────────────────────────────────────────────
//
// Same shape as the descriptor but label and onClick are required. Dialogs
// supply this per slot to define what "show with defaults" means for that slot.
// Extending Button props (via the descriptor base) means form, size, type, etc.
// can all be set in defaults — the confirm slot might default to type="submit"
// and form="my-form-id" for example.

export type DialogActionButtonSlotDefaults<T, TCtx = undefined> =
  DialogActionButtonDescriptor<T, TCtx> & {
    label: ReactNode;
    onClick: (actions: DialogActions<T>, ctx: TCtx) => void;
  };

// ─── Main union ───────────────────────────────────────────────────────────────
//
// Ordered from most constrained (true/false) to least (ReactNode).
//
// The callback variant `(actions, ctx) => descriptor | ReactNode` is the
// dynamic escape hatch: the returned descriptor has access to both dialog
// control methods and any context the dialog passes (form state, timer, etc.).
// If the callback returns null/false the button is hidden.
//
// ReactNode is the static escape hatch: arbitrary JSX with no dialog state.

export type DialogActionButton<T, TCtx = undefined> =
  | true
  | false
  | string
  | DialogActionButtonDescriptor<T, TCtx>
  | ((
      actions: DialogActions<T>,
      ctx: TCtx,
    ) => DialogActionButtonDescriptor<T, TCtx> | ReactNode)
  | ReactNode;

// ─── Container ────────────────────────────────────────────────────────────────

export type DialogActionsContainer<T, TCtx = undefined> =
  | React.ComponentProps<"div">
  | ((
      children: ReactNode,
      dialogActions: DialogActions<T>,
      ctx: TCtx,
    ) => ReactNode);

// ─── Runtime discrimination ───────────────────────────────────────────────────

function isDescriptor<T, TCtx>(
  value: unknown,
): value is DialogActionButtonDescriptor<T, TCtx> {
  return (
    value !== null &&
    typeof value === "object" &&
    !React.isValidElement(value) &&
    !Array.isArray(value)
  );
}

// ─── renderDialogButton ───────────────────────────────────────────────────────
//
// Core primitive. Renders a single DialogActionButton value against a set of
// slot defaults. Dialogs can call this directly when they need per-slot control
// (e.g. the countdown confirm button whose disabled state comes from a timer).
//
// Resolution order:
//   undefined | false | null  → null (not rendered)
//   function (callback)       → call(actions, ctx), then re-resolve result
//   true                      → Button with all slot defaults
//   string                    → Button with defaults, label replaced
//   React element / array     → rendered as-is (ReactNode)
//   plain object              → Button with descriptor merged over defaults

export function renderDialogButton<T, TCtx = undefined>(
  button: DialogActionButton<T, TCtx> | undefined,
  dialogActions: DialogActions<T>,
  ctx: TCtx,
  defaults: DialogActionButtonSlotDefaults<T, TCtx>,
): ReactNode {
  if (button === undefined || button === false || button === null) return null;

  // Callback: returns a descriptor or ReactNode — re-resolve the result.
  if (typeof button === "function") {
    return renderDialogButton(
      button(dialogActions, ctx) as DialogActionButton<T, TCtx>,
      dialogActions,
      ctx,
      defaults,
    );
  }

  const { label: defLabel, onClick: defOnClick, disabled: defDisabled, ...defButtonProps } = defaults;

  if (button === true) {
    return (
      <Button
        {...defButtonProps}
        disabled={defDisabled}
        onClick={() => defOnClick(dialogActions, ctx)}
      >
        {defLabel}
      </Button>
    );
  }

  if (typeof button === "string") {
    return (
      <Button
        {...defButtonProps}
        disabled={defDisabled}
        onClick={() => defOnClick(dialogActions, ctx)}
      >
        {button}
      </Button>
    );
  }

  // ReactNode fallback (React elements, arrays, numbers, etc.)
  if (!isDescriptor<T, TCtx>(button)) {
    return button as ReactNode;
  }

  // Descriptor: merge over defaults; descriptor wins per field.
  const { label, onClick, disabled, ...descButtonProps } = button;
  return (
    <Button
      {...defButtonProps}
      {...descButtonProps}
      disabled={disabled ?? defDisabled}
      onClick={() => (onClick ?? defOnClick)(dialogActions, ctx)}
    >
      {label ?? defLabel}
    </Button>
  );
}

// ─── renderDialogActions ──────────────────────────────────────────────────────
//
// Renders an ordered list of button slots inside a container div (or a custom
// container). Each dialog builds this list itself, controlling both slot order
// and which slots get meaningful defaults. This is the most flexible form.
//
// Array values in the slot list render each element consecutively in place.

export interface DialogButtonSlot<T, TCtx = undefined> {
  button: DialogActionButton<T, TCtx> | undefined;
  defaults: DialogActionButtonSlotDefaults<T, TCtx>;
  key?: string;
}

export function renderDialogActions<T, TCtx = undefined>(
  slots: DialogButtonSlot<T, TCtx>[],
  dialogActions: DialogActions<T>,
  ctx: TCtx,
  container?: DialogActionsContainer<T, TCtx>,
): ReactNode {
  const rendered = slots.map((slot, i) => {
    const node = renderDialogButton(slot.button, dialogActions, ctx, slot.defaults);
    return node != null ? (
      <React.Fragment key={slot.key ?? i}>{node}</React.Fragment>
    ) : null;
  });

  if (typeof container === "function") {
    return container(rendered, dialogActions, ctx);
  }

  const { className, ...rest } = (container as React.ComponentProps<"div">) ?? {};
  return (
    <div className={cn("flex justify-end gap-3 pt-2", className)} {...rest}>
      {rendered}
    </div>
  );
}

// ─── renderStandardDialogActions ─────────────────────────────────────────────
//
// Convenience helper for the most common layout: [cancel] [custom…] [confirm].
//
// - cancelButton and confirmButton are shown by default when their slot defaults
//   are provided (pass `false` to explicitly hide).
// - customButtons are always user-supplied (no dialog-level defaults apply — the
//   dialog doesn't know what a generic "extra button" should do).
// - Dialogs without a cancel or confirm slot simply omit the relevant defaults key.

export interface StandardDialogActionsConfig<T, TCtx = undefined> {
  cancelButton?: DialogActionButton<T, TCtx>;
  customButtons?: DialogActionButton<T, TCtx>[];
  confirmButton?: DialogActionButton<T, TCtx>;
  container?: DialogActionsContainer<T, TCtx>;
}

export interface StandardDialogActionsDefaults<T, TCtx = undefined> {
  cancel?: DialogActionButtonSlotDefaults<T, TCtx>;
  confirm?: DialogActionButtonSlotDefaults<T, TCtx>;
}

export function renderStandardDialogActions<T, TCtx = undefined>(
  config: StandardDialogActionsConfig<T, TCtx>,
  dialogActions: DialogActions<T>,
  ctx: TCtx,
  defaults: StandardDialogActionsDefaults<T, TCtx>,
): ReactNode {
  const slots: DialogButtonSlot<T, TCtx>[] = [];

  if (defaults.cancel) {
    // undefined → show with defaults; false → hide; anything else → configure
    const effective = config.cancelButton === undefined ? true : config.cancelButton;
    slots.push({ button: effective, defaults: defaults.cancel, key: "cancel" });
  }

  (config.customButtons ?? []).forEach((btn, i) => {
    // Custom buttons carry no semantic meaning from the dialog's perspective.
    // The caller must fully specify them (descriptor, render fn, or ReactNode).
    // The placeholder defaults here are never actually used — any button value
    // other than true/undefined would bring its own label and onClick.
    slots.push({
      button: btn,
      defaults: { label: "", variant: "outline", onClick: () => {} },
      key: `custom-${i}`,
    });
  });

  if (defaults.confirm) {
    const effective = config.confirmButton === undefined ? true : config.confirmButton;
    slots.push({ button: effective, defaults: defaults.confirm, key: "confirm" });
  }

  return renderDialogActions(slots, dialogActions, ctx, config.container);
}

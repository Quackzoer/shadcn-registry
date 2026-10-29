import { fromSafePromise, type ResultAsync } from "neverthrow";
import {
  dialog as originalDialog,
  type DialogResult,
  type DialogResultData,
  type DialogOptions,
  type DialogActions,
} from "@/registry/dynamic-dialog/lib/dynamic-dialog-state";

// ---------------------------------------------------------------------------
// Error types
// ---------------------------------------------------------------------------

export interface NeverthrowDialogDenied {
  type: "denied";
  id: string;
}

export interface NeverthrowDialogDismissed {
  type: "dismissed";
  id: string;
  reason?: string;
}

export type NeverthrowDialogError<TValue = unknown> =
  | NeverthrowDialogDenied
  | NeverthrowDialogDismissed;

// ---------------------------------------------------------------------------
// Augment DialogResult with .result()
// ---------------------------------------------------------------------------

declare module "@/registry/dynamic-dialog/lib/dynamic-dialog-state" {
  interface DialogResult<TValue = unknown> {
    /** Wrap this dialog result as a neverthrow `ResultAsync`. */
    result(): ResultAsync<TValue, NeverthrowDialogError<TValue>>;
  }
}

// ---------------------------------------------------------------------------
// Runtime: patch dialogObservable.showDialog so every result gets .result()
// ---------------------------------------------------------------------------

import { dialogObservable } from "@/registry/dynamic-dialog/lib/dynamic-dialog-state";

const originalShowDialog = dialogObservable.showDialog.bind(dialogObservable);

dialogObservable.showDialog = function <
  TValue,
>(
  Component: Parameters<typeof originalShowDialog>[0],
  componentProps: Record<string, unknown>,
  options: DialogOptions,
): DialogResult<TValue> {
  const base = originalShowDialog<TValue>(Component, componentProps, options);

  return Object.assign(base, {
    result(): ResultAsync<TValue, NeverthrowDialogError<TValue>> {
      return fromSafePromise(
        new Promise<DialogResultData<TValue>>((resolve) => {
          base.then(resolve);
        }),
      ).map((r) => {
        if (r.confirmed) return r.value as TValue;
        if (r.denied)
          throw { type: "denied" as const, id: r.id };
        throw {
          type: "dismissed" as const,
          id: r.id,
          reason: r.reason,
        };
      });
    },
  });
};

// ---------------------------------------------------------------------------
// Standalone wrapper: wrap any DialogResult after the fact
// ---------------------------------------------------------------------------

export function dialogResult<TValue>(
  result: DialogResult<TValue>,
): ResultAsync<TValue, NeverthrowDialogError<TValue>> {
  return fromSafePromise(
    new Promise<DialogResultData<TValue>>((resolve) => {
      result.then(resolve);
    }),
  ).map((r) => {
    if (r.confirmed) return r.value as TValue;
    if (r.denied)
      throw { type: "denied" as const, id: r.id };
    throw {
      type: "dismissed" as const,
      id: r.id,
      reason: r.reason,
    };
  });
}

// ---------------------------------------------------------------------------
// Explicit wrapper: use instead of dialog() for neverthrow-native code
// ---------------------------------------------------------------------------

type OwnProps<TProps, TValue> = Omit<TProps, keyof DialogActions<TValue>>;

export function neverthrowDialog<
  TProps extends DialogActions<TValue>,
  TValue = TProps extends DialogActions<infer V> ? V : unknown,
>(
  Component: React.ComponentType<TProps>,
  defaultOptions?: DialogOptions,
) {
  return (arg?: {
    props?: OwnProps<TProps, TValue>;
    options?: DialogOptions;
  }) => {
    const result = originalDialog(
      Component as React.ComponentType<DialogActions<TValue>>,
      defaultOptions,
    )(arg);
    return Object.assign(result, {
      result(): ResultAsync<TValue, NeverthrowDialogError<TValue>> {
        return dialogResult(result);
      },
    });
  };
}

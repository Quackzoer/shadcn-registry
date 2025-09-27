import React from 'react';
import { ConfirmDialog, type ConfirmDialogProps } from '@/registry/new-york/ui/dynamic-dialog/dialogs/ConfirmDialog';
import { CountdownDialog, type CountdownDialogProps } from '@/registry/new-york/ui/dynamic-dialog/dialogs/CountdownDialog';
import { DelayedActionDialog, type DelayedActionDialogProps } from '@/registry/new-york/ui/dynamic-dialog/dialogs/DelayedActionDialog';
import { TypeToConfirmDialog, type TypeToConfirmDialogProps } from '@/registry/new-york/ui/dynamic-dialog/dialogs/TypeToConfirmDialog';
import { dialogObservable } from '@/registry/new-york/lib/dynamic-dialog/state';
import type { DialogProps, DialogRendererProps, DialogResult, DialogUserConfig } from '@/registry/new-york/lib/dynamic-dialog/types';
import { DismissReason } from '@/registry/new-york/lib/dynamic-dialog/types';
 

/**
 * Creates a dialog function that can be called with props to show a dialog.
 *
 * @param render - A function that takes dialog properties and returns a React node.
 * @param defaultOptions - Default dialog configuration options.
 * @typeParam RendererProps - Additional properties to be passed to the React Component. This type is merged with DialogRendererProps.
 * @typeParam TValue - The type of value that the dialog will return upon resolving.
 * @returns A function that accepts renderer props and dialog options to show the dialog.
 *
 * @example - Basic usage with a custom renderer:
 * ```ts
 * const customDialog = dialog<{ customProp: string }, boolean>(CustomComponent, {important: true});
 * const result = customDialog({ customProp: 'value' });
 * const value = result.value; // Promise<boolean>
 * const awaitedValue = await value; // boolean
 * const isConfirmed = result.isConfirmed; // boolean
 * ```
 * @example - Usage with dialog props for control:
 * ```ts
 * const asyncDialog = dialog<{}, string>(ExampleComponent);
 * const result = asyncDialog({}, { id: 'my-dialog', important: true });
 * const value = result.value; // string
 * const isConfirmed = result.isConfirmed; // boolean
 * ```
 * @example - Dismissing a dialog using dismiss helper:
 * ```ts
 * const exampleDialog = dialog<{}, void>(ExampleComponent);
 * const result = exampleDialog();
 * // Dismiss the dialog after 2 seconds
 * setTimeout(() => {
 *   result.dismiss();
 * }, 2000);
 * ```
 */
export const dialog = <RendererProps = unknown, TValue = unknown>(
  render: (props: DialogRendererProps<TValue> & RendererProps) => React.ReactNode,
  defaultOptions?: Partial<DialogProps<TValue>> & DialogUserConfig
) => {
  return (
    rendererProps: RendererProps,
    dialogOptions?: Partial<DialogProps<TValue>> & DialogUserConfig
  ): DialogResult<TValue> => {
    const mergedOptions = { ...defaultOptions, ...dialogOptions };

    return dialogObservable.showDialog({
      render: (dialogProps: DialogRendererProps<TValue>) =>
        render({ ...dialogProps, ...rendererProps } as DialogRendererProps<TValue> & RendererProps),
      onOpen: () => {},
      onClose: () => {},
      ...mergedOptions
    });
  };
};

const dismissDialog = (id?: string, reason: DismissReason = DismissReason.CLOSE, value?: unknown) => {
  if (id) {
    dialogObservable.dismissDialog(id, reason, value);
  } else {
    dialogObservable.dismissAllDialogs(reason, value);
  }
}

const typeToConfirmDialog = dialog<TypeToConfirmDialogProps, {itemName: string}>(TypeToConfirmDialog, { important: true });

const countdownDialog = dialog<CountdownDialogProps, string>(CountdownDialog);

const delayedActionDialog = dialog<DelayedActionDialogProps, boolean>(DelayedActionDialog);

const confirm = dialog<ConfirmDialogProps, boolean>(ConfirmDialog, { important: true });

//* Utils

/**
 * Dismiss a dialog by ID or all dialogs at once.
 * @param id - Optional dialog ID, if not provided all dialogs will be dismissed.
 * @param reason - The reason for dismissing the dialog.
 * @param value - Optional value to pass when dismissing the dialog.
 * @example - Dismiss a specific dialog by ID:
 * ```ts
 * const exampleDialog = exampleDialog();
 * dialog.dismiss(exampleDialog.id, DismissReason.CANCEL, { some: 'data' });
 * ```
 * @example - Dismiss all dialogs at once:
 * ```ts
 * dialog.dismiss(undefined, DismissReason.CANCEL, { some: 'data' });
 * // or simply
 * dialog.dismiss();
 * ```
 */
dialog.dismiss = dismissDialog;

//* Predefined dialogs
dialog.countdown = countdownDialog;
dialog.delayedAction = delayedActionDialog;
dialog.typeToConfirm = typeToConfirmDialog;
dialog.confirm = confirm;
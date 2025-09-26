import React from 'react';
import { ConfirmDialog, ConfirmDialogProps } from '@/registry/new-york/ui/confirmation-dialog/dialogs/ConfirmDialog';
import { CountdownDialog, CountdownDialogProps } from '@/registry/new-york/ui/confirmation-dialog/dialogs/CountdownDialog';
import { DelayedActionDialog } from '@/registry/new-york/ui/confirmation-dialog/dialogs/DelayedActionDialog';
import { TypeToConfirmDialog, TypeToConfirmDialogProps } from '@/registry/new-york/ui/confirmation-dialog/dialogs/TypeToConfirmDialog';
import { dialogObservable } from '@/registry/new-york/lib/confirmation-dialog/state';
import { DialogProps, DialogRendererProps, DialogResult, DismissReason } from '@/registry/new-york/lib/confirmation-dialog/types';
 

export const renderDialog = <TValue = unknown>(
  render: (props: DialogRendererProps<TValue>) => React.ReactNode,
  options?: Partial<DialogProps<TValue>>
): DialogResult<TValue> => {
  return dialogObservable.showDialog({
    render,
    ...options
  });
};
/**
 * 
 * @param render - A function that takes dialog properties and returns a React node.
 * @param options - Optional dialog configuration options.
 * @typeParam RendererProps - Additional properties to be passed to the React Component. This type is merged with DialogRendererProps.
 * @typeParam TValue - The type of value that the dialog will return upon resolving.
 * @returns A DialogResult object containing the dialog ID, metadata, and helper functions like `dismiss` or `async`.
 * 
 * @example - Basic usage with a custom renderer:
 * ```ts
 * const customDialog = dialog<{ customProp: string }, boolean>(CustomComponent, {important: true});
 * const result = customDialog({ customProp: 'value' });
 * const value = result.value; // Promise<boolean>
 * const awaitedValue = await value; // boolean
 * const isConfirmed = result.isConfirmed; // boolean
 * ```
 * @example - Usage of async helper:
 * ```ts
 * const asyncDialog = dialog<{}, string>(ExampleComponent);
 * const result = asyncDialog().async();
 * const value = result.value; // string
 * const isConfirmed = result.isConfirmed; // boolean
 * ```
 * @example - Dismissing a dialog using dismiss helper:
 * ```ts
 * const exampleDialog = dialog<{}, void>(ExampleComponent);
 * const result = exampleDialog();
 * // Dismiss the dialog after 2 seconds
 * setTimeout(() => {
 *   exampleDialog.dismiss();
 * }, 2000);
 * ```
 */
export const dialog = <RendererProps = unknown, TValue = unknown>(
  render: (props: DialogRendererProps<TValue> & RendererProps) => React.ReactNode,
  options?: Partial<DialogProps<TValue>>
) => {
  return (rendererProps: RendererProps & Partial<DialogRendererProps<TValue>>): DialogResult<TValue> => {
    return renderDialog<TValue>((dialogProps: DialogRendererProps<TValue>) =>
      render({ ...dialogProps, ...rendererProps } as DialogRendererProps<TValue> & RendererProps),
      options
    );
  };
};

const typeToConfirmDialog = dialog<TypeToConfirmDialogProps, {itemName: string}>(TypeToConfirmDialog, { important: true });

const countdownDialog = dialog<CountdownDialogProps, string>(CountdownDialog);

const delayedActionDialog = dialog<{delaySeconds: number; warningMessage?: string; allowCancel?: boolean; dangerAction?: boolean}, boolean>(DelayedActionDialog);

const confirm = dialog<ConfirmDialogProps, boolean>(
  ConfirmDialog,
  { important: true }
);

//* Utils
dialog.render = renderDialog;


const dismissDialog = (id?: string, reason: DismissReason = DismissReason.CLOSE, value?: unknown) => {
  if (id) {
    dialogObservable.dismissDialog(id, reason, value);
  } else {
    dialogObservable.dismissAllDialogs(reason, value);
  }
}
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
 * ```
 */
dialog.dismiss = dismissDialog;

//* Predefined dialogs
dialog.countdown = countdownDialog;
dialog.delayedAction = delayedActionDialog;
dialog.typeToConfirm = typeToConfirmDialog;
dialog.confirm = confirm;
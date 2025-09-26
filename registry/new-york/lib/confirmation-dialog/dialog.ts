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

const dismissDialog = (id?: string, reason: DismissReason = DismissReason.CLOSE, value?: unknown) => {
  if (id) {
    dialogObservable.dismissDialog(id, reason, value);
  } else {
    dialogObservable.dismissAllDialogs(reason, value);
  }
}

const deleteConfirmDialog = ({
  itemName,
  ...options
}: {
  itemName: string;
} & Partial<DialogProps<{itemName: string}>>) => {
  return dialog<{itemName: string}>(
    (props) => TypeToConfirmDialog({ ...props, itemName }),
    { important: true, ...options }
  );
}

const typeToConfirmDialog = dialog<TypeToConfirmDialogProps, {itemName: string}>(TypeToConfirmDialog, { important: true });

// Example usage:
const exampleDialog = typeToConfirmDialog({ itemName: 'example', onClose: () => console.log('Dialog closed') });
console.log('Dialog ID:', exampleDialog.id);
console.log('Is open:', exampleDialog.open);
exampleDialog.dismiss(); // Dismiss the dialog
await exampleDialog.value; // Wait for the result value

// Or use async() for chaining with all resolved data:
const result = await typeToConfirmDialog({ itemName: 'abc' }).async();
console.log('Result:', result); // { id, isConfirmed, isDenied, isDismissed, value, dismissReason }

const countdownDialog = dialog<CountdownDialogProps, string>(CountdownDialog);

const delayedActionDialog = dialog<{delaySeconds: number; warningMessage?: string; allowCancel?: boolean; dangerAction?: boolean}, boolean>(DelayedActionDialog);

const confirm = dialog<ConfirmDialogProps, boolean>(
  ConfirmDialog,
  { important: true }
);

//* Utils
dialog.render = renderDialog;
dialog.dismiss = dismissDialog;

//* Predefined dialogs
dialog.delete = deleteConfirmDialog;
dialog.countdown = countdownDialog;
dialog.delayedAction = delayedActionDialog;
dialog.typeToConfirm = typeToConfirmDialog;
dialog.confirm = confirm;
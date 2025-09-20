import React from 'react';
import { CountdownDialog } from './example/CountdownDialog';
import { DelayedActionDialog } from './example/DelayedActionDialog';
import { TypeToConfirmDialog } from './example/TypeToConfirm';
import { dialogObservable } from './state';
import type { DialogProps, DialogResult, DismissReason } from './types';



export const dialog = <TValue = unknown, TDeny = TValue, TDismiss extends DismissReason = DismissReason>(
  render: (props: DialogProps<TValue, TDeny, TDismiss>) => React.ReactNode,
  options?: Partial<DialogProps<TValue, TDeny, TDismiss>>
): Promise<DialogResult<TValue, TDeny, TDismiss>> => {
  return dialogObservable.showDialog({
    render,
    ...options
  });
};

const deleteConfirmDialog = ({itemName}:{itemName: string}): Promise<DialogResult<{itemName: string}, {itemName: string}, DismissReason.CANCEL | DismissReason.ESC>> => {
  return dialog<{itemName: string}, {itemName: string}, DismissReason.CANCEL | DismissReason.ESC>(
    (props: DialogProps<{itemName: string}, {itemName: string}, DismissReason.CANCEL | DismissReason.ESC>) => TypeToConfirmDialog({ ...props, itemName }),
    { important: true }
  );
}

const countdownDialog = ({
  countdownSeconds,
  autoConfirm,
  showProgress
}: {
  countdownSeconds: number;
  autoConfirm?: boolean;
  showProgress?: boolean;
}): Promise<DialogResult<string, string, DismissReason.TIMER | DismissReason.CANCEL | DismissReason.ESC>> => {
  return dialog<string, string, DismissReason.TIMER | DismissReason.CANCEL | DismissReason.ESC>(
    (props: DialogProps<string, string, DismissReason.TIMER | DismissReason.CANCEL | DismissReason.ESC>) => CountdownDialog({
      ...props,
      countdownSeconds,
      autoConfirm,
      showProgress,
    })
  );
}

const delayedActionDialog = ({
  delaySeconds,
  warningMessage,
  allowCancel,
  dangerAction
}: {
  delaySeconds: number;
  warningMessage?: string;
  allowCancel?: boolean;
  dangerAction?: boolean;
}): Promise<DialogResult<boolean, boolean, DismissReason.TIMER | DismissReason.CANCEL | DismissReason.ESC>> => {
  return dialog<boolean, boolean, DismissReason.TIMER | DismissReason.CANCEL | DismissReason.ESC>(
    (props: DialogProps<boolean, boolean, DismissReason.TIMER | DismissReason.CANCEL | DismissReason.ESC>) => DelayedActionDialog({
      ...props,
      delaySeconds,
      warningMessage,
      allowCancel,
      dangerAction,
    })
  );
}

const typeToConfirmDialog = ({itemName}:{itemName: string}): Promise<DialogResult<{itemName: string}, {itemName: string}, DismissReason.CANCEL | DismissReason.ESC>> => {
  return dialog<{itemName: string}, {itemName: string}, DismissReason.CANCEL | DismissReason.ESC>(
    (props: DialogProps<{itemName: string}, {itemName: string}, DismissReason.CANCEL | DismissReason.ESC>) => TypeToConfirmDialog({ ...props, itemName }),
    { important: true }
  );
}

dialog.delete = deleteConfirmDialog;
dialog.countdown = countdownDialog;
dialog.delayedAction = delayedActionDialog;
dialog.typeToConfirm = typeToConfirmDialog;
import React from 'react';
import { CountdownDialog } from './example/CountdownDialog';
import { DelayedActionDialog } from './example/DelayedActionDialog';
import { TypeToConfirmDialog } from './example/TypeToConfirm';
import { dialogObservable } from './state';
import type { DialogProps } from './types';



export const dialog = (render: (props: any) => React.ReactNode, options?: Partial<DialogProps>) => {
  return dialogObservable.showDialog({
    render,
    ...options
  });
};

const deleteConfirmDialog = ({itemName}:{itemName: string}) => {
  return dialog((props: DialogProps) => TypeToConfirmDialog({ ...props, itemName }), { important: true });
}

const countdownDialog = ({
  countdownSeconds,
  autoConfirm,
  showProgress
}: {
  countdownSeconds: number;
  autoConfirm?: boolean;
  showProgress?: boolean;
}) => {
  return dialog((props: DialogProps) => CountdownDialog({
    ...props,
    countdownSeconds,
    autoConfirm,
    showProgress,
  }));
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
}) => {
  return dialog((props: DialogProps) => DelayedActionDialog({
    ...props,
    delaySeconds,
    warningMessage,
    allowCancel,
    dangerAction,
  }));
}

const typeToConfirmDialog = ({itemName}:{itemName: string}) => {
  return dialog((props: DialogProps) => TypeToConfirmDialog({ ...props, itemName }), { important: true });
}

dialog.delete = deleteConfirmDialog;
dialog.countdown = countdownDialog;
dialog.delayedAction = delayedActionDialog;
dialog.typeToConfirm = typeToConfirmDialog;
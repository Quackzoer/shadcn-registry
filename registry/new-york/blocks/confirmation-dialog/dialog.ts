import React from 'react';
import { ConfirmDialog } from './example/Confirm';
import { CountdownDialog } from './example/CountdownDialog';
import { DelayedActionDialog } from './example/DelayedActionDialog';
import { TypeToConfirmDialog } from './example/TypeToConfirm';
import { dialogObservable } from './state';
import type { DialogProps, DialogResult } from './types';



export const dialog = <TValue = unknown>(
  render: (props: DialogProps<TValue>) => React.ReactNode,
  options?: Partial<DialogProps<TValue>>
): Promise<DialogResult<TValue>> => {
  return dialogObservable.showDialog({
    render,
    ...options
  });
};

const deleteConfirmDialog = ({itemName}:{itemName: string}): Promise<DialogResult<{itemName: string}>> => {
  return dialog<{itemName: string}>(
    (props) => TypeToConfirmDialog({ ...props, itemName }),
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
}): Promise<DialogResult<string>> => {
  return dialog<string>(
    (props) => CountdownDialog({
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
}): Promise<DialogResult<boolean>> => {
  return dialog<boolean>(
    (props) => DelayedActionDialog({
      ...props,
      delaySeconds,
      warningMessage,
      allowCancel,
      dangerAction,
    })
  );
}

const typeToConfirmDialog = ({itemName}:{itemName: string}): Promise<DialogResult<{itemName: string}>> => {
  return dialog<{itemName: string}>(
    (props) => TypeToConfirmDialog({ ...props, itemName }),
    { important: true }
  );
}

const confirm = ({title, description}: {title: string; description: string})=> {
  return dialog(
    (props) => ConfirmDialog({ ...props, title, description }),
    { important: true }
  );
}

dialog.delete = deleteConfirmDialog;
dialog.countdown = countdownDialog;
dialog.delayedAction = delayedActionDialog;
dialog.typeToConfirm = typeToConfirmDialog;
dialog.confirm = confirm;
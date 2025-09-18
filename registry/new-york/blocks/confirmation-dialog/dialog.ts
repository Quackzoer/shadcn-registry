import React from 'react';
import { CountdownDialog } from './example/CountdownDialog';
import { DelayedActionDialog } from './example/DelayedActionDialog';
import { TypeToConfirmDialog } from './example/TypeToConfirm';
import { dialogObservable } from './state';
import type { DialogProps } from './types';

export const deleteConfirm = (itemName: string, options?: Partial<DialogProps>) => {
  return dialogObservable.showDialog({
    render: (props: DialogProps) => TypeToConfirmDialog({ ...props, itemName }),
    important: true,
    ...options
  });
};

export const countdown = (
  countdownSeconds: number,
  options?: Partial<DialogProps> & {
    autoConfirm?: boolean;
    showProgress?: boolean;
  }
) => {
  return dialogObservable.showDialog({
    render: (props: DialogProps) => CountdownDialog({
      ...props,
      countdownSeconds,
      autoConfirm: options?.autoConfirm,
      showProgress: options?.showProgress,
    }),
    ...options
  });
};

export const delayedAction = (
  delaySeconds: number,
  options?: Partial<DialogProps> & {
    warningMessage?: string;
    allowCancel?: boolean;
    dangerAction?: boolean;
  }
) => {
  return dialogObservable.showDialog({
    render: (props: DialogProps) => DelayedActionDialog({
      ...props,
      delaySeconds,
      warningMessage: options?.warningMessage,
      allowCancel: options?.allowCancel,
      dangerAction: options?.dangerAction,
    }),
    ...options
  });
};

export const dialog = (render: (props: unknown) => React.ReactNode, options?: Partial<DialogProps>) => {
  return dialogObservable.showDialog({
    render,
    ...options
  });
};

const typeToConfirmDialog = ({itemName}:{itemName: string}) => {
  return dialog((props: DialogProps) => TypeToConfirmDialog({ ...props, itemName }), { important: true });
}

dialog.delete = deleteConfirm;
dialog.countdown = countdown;
dialog.delayedAction = delayedAction;
dialog.typeToConfirm = typeToConfirmDialog;
import React from 'react';
import { ConfirmDialog } from './example/Confirm';
import { CountdownDialog } from './example/CountdownDialog';
import { DelayedActionDialog } from './example/DelayedActionDialog';
import { TypeToConfirmDialog } from './example/TypeToConfirm';
import { dialogObservable } from './state';
import { DialogProps, DialogResult, DismissReason } from './types';



export const dialog = <TValue = unknown>(
  render: (props: DialogProps<TValue>) => React.ReactNode,
  options?: Partial<DialogProps<TValue>>
): Promise<DialogResult<TValue>> => {
  return dialogObservable.showDialog({
    render,
    ...options
  });
};

dialog.dismiss = (id?: string, reason: DismissReason = DismissReason.CLOSE, value?: unknown) => {
  if (id) {
    dialogObservable.dismissDialog(id, reason, value);
  } else {
    dialogObservable.dismissAllDialogs(reason, value);
  }
};


const deleteConfirmDialog = ({
  itemName,
  ...options
}: {
  itemName: string;
} & Partial<DialogProps<{itemName: string}>>): Promise<DialogResult<{itemName: string}>> => {
  return dialog<{itemName: string}>(
    (props) => TypeToConfirmDialog({ ...props, itemName }),
    { important: true, ...options }
  );
}

const countdownDialog = ({
  countdownSeconds,
  autoConfirm,
  showProgress,
  ...options
}: {
  countdownSeconds: number;
  autoConfirm?: boolean;
  showProgress?: boolean;
} & Partial<DialogProps<string>>): Promise<DialogResult<string>> => {
  return dialog<string>(
    (props) => CountdownDialog({
      ...props,
      countdownSeconds,
      autoConfirm,
      showProgress,
    }),
    options
  );
}

const delayedActionDialog = ({
  delaySeconds,
  warningMessage,
  allowCancel,
  dangerAction,
  ...options
}: {
  delaySeconds: number;
  warningMessage?: string;
  allowCancel?: boolean;
  dangerAction?: boolean;
} & Partial<DialogProps<boolean>>): Promise<DialogResult<boolean>> => {
  return dialog<boolean>(
    (props) => DelayedActionDialog({
      ...props,
      delaySeconds,
      warningMessage,
      allowCancel,
      dangerAction,
    }),
    options
  );
}

const typeToConfirmDialog = ({
  itemName,
  ...options
}: {
  itemName: string;
} & Partial<DialogProps<{itemName: string}>>): Promise<DialogResult<{itemName: string}>> => {
  return dialog<{itemName: string}>(
    (props) => TypeToConfirmDialog({ ...props, itemName }),
    { important: true, ...options }
  );
}

const confirm = ({
  title,
  description,
  ...options
}: {
  title: string;
  description: string;
} & Partial<DialogProps<boolean>>)=> {
  return dialog(
    (props) => ConfirmDialog({ ...props, title, description }),
    { important: true, ...options }
  );
}

dialog.delete = deleteConfirmDialog;
dialog.countdown = countdownDialog;
dialog.delayedAction = delayedActionDialog;
dialog.typeToConfirm = typeToConfirmDialog;
dialog.confirm = confirm;
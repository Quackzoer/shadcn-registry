import React from 'react';

export interface DialogAction {
  value: unknown;
  isConfirmed?: boolean;
}

export interface DialogProps<TValue = unknown, TDeny = TValue, TDismiss extends DismissReason = DismissReason> {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  important?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  render: (props: DialogProps<TValue, TDeny, TDismiss>) => React.ReactNode;
  confirm: (value?: TValue) => void;
  deny: (value?: TDeny) => void;
  cancel: () => void;
  dismiss: (reason: TDismiss, value?: unknown) => void;
  closeDialog: () => void;
}

export enum DismissReason {
  BACKDROP_CLICK = 'backdrop',
  CANCEL = 'cancel',
  CLOSE = 'close',
  ESC = 'esc',
  TIMER = 'timer',
  OVERLAY = 'overlay'
}

export interface DialogResult<TValue = unknown, TDeny = TValue, TDismiss extends DismissReason = DismissReason> {
  isConfirmed: boolean;
  isDenied: boolean;
  isDismissed: boolean;
  value?: TValue | TDeny;
  dismissReason?: TDismiss;
  dismissValue?: unknown;
}

export type DismissData<T = unknown> = {
  reason: DismissReason;
  value?: T;
}
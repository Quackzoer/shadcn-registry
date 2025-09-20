import React from 'react';

export interface DialogAction {
  value: unknown;
  isConfirmed?: boolean;
}

export interface DialogProps<TValue = unknown> {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  important?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  render: (props: DialogProps<TValue>) => React.ReactNode;
  confirm: (value?: TValue) => void;
  deny: (value?: TValue) => void;
  cancel: () => void;
  dismiss: (reason: DismissReason, value?: TValue) => void;
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

export interface DialogResult<TValue = unknown> {
  isConfirmed: boolean;
  isDenied: boolean;
  isDismissed: boolean;
  value?: TValue;
  dismissReason?: DismissReason;
}

export type DismissData<T = unknown> = {
  reason: DismissReason;
  value?: T;
}
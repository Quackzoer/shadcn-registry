export interface DialogProps<T = unknown> {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  important?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  render: (props: DialogProps<T>) => React.ReactNode;
  confirm: (value?: T) => void;
  deny: (value?: T) => void;
  cancel: () => void;
  dismiss: (reason: DismissReason, value?: T) => void;
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

export interface DialogResult<T = unknown> {
  id: string;
  isConfirmed: boolean;
  isDenied: boolean;
  isDismissed: boolean;
  value?: T;
  dismissReason?: DismissReason;
}

export type DismissData<T = unknown> = {
  reason: DismissReason;
  value?: T;
}
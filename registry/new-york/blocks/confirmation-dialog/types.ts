export interface DialogProps<T = unknown> {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  important?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  render: (props: DialogProps) => React.ReactNode;
  confirm: (value?: T) => void;
  deny: (value?: T) => void;
  cancel: () => void;
  dismiss: (reason: DismissReason, value?: unknown) => void;
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
  dismiss?: DismissReason;
}
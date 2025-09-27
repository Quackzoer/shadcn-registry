export interface DialogActions<T = unknown> {
  confirm: (value?: T) => void;
  deny: (value?: T) => void;
  cancel: () => void;
  dismiss: (reason: DismissReason, value?: T) => void;
  closeDialog: () => void;
}

export interface DialogCallbacks {
  onOpen: () => void;
  onClose: () => void;
}

export interface DialogRendererProps<T = unknown> extends DialogActions<T>, DialogCallbacks {}

export type DialogUserConfig = Partial<DialogCallbacks>;

export interface DialogProps<T = unknown> {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  important?: boolean;
  render: (props: DialogRendererProps<T>) => React.ReactNode;
}

export interface DialogState<T = unknown> extends DialogProps<T>, DialogCallbacks {}

export type DismissReason = Autocomplete<"backdrop" | "cancel" | "close" | "esc" | "timer" | "overlay">;

export interface DialogResult<T = unknown> {
  id: string;
  isConfirmed: boolean;
  isDenied: boolean;
  isDismissed: boolean;
  open: boolean;
  value: Promise<T | undefined>;
  dismissReason?: DismissReason;
  dismiss: (reason?: DismissReason, value?: T) => void;
  async: () => Promise<{
    id: string;
    isConfirmed: boolean;
    isDenied: boolean;
    isDismissed: boolean;
    value?: T;
    dismissReason?: DismissReason;
  }>;
}

export type DismissData<T = unknown> = {
  reason: DismissReason;
  value?: T;
};

export type Autocomplete<T extends string> = T | string & {}
import React from 'react';

export interface DialogActions<T = unknown> {
  confirm: (value?: T) => void;
  deny: (value?: T) => void;
  dismiss: (reason: DismissReason, value?: T) => void;
}

export interface DialogCallbacks {
  onOpen: () => void;
  onClose: () => void;
}

export interface DialogRendererProps<T = unknown> extends DialogActions<T>, DialogCallbacks {}

export type DialogUserConfig = Partial<DialogCallbacks> & {
  singleton?: boolean;
};

export interface DialogProps<T = unknown> {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  render: (props: DialogRendererProps<T>) => React.ReactNode;
}

export interface DialogState<T = unknown> extends DialogProps<T>, DialogCallbacks {
  _version: number;
}

export type DismissReason = Autocomplete<"backdrop" | "cancel" | "close" | "esc" | "timer">;

export interface DialogResultData<T = unknown> {
  id: string;
  isConfirmed: boolean;
  isDenied: boolean;
  isDismissed: boolean;
  value?: T;
  dismissReason?: DismissReason;
}

/**
 * Returned immediately when a dialog is shown. Await it to get the result once the user acts.
 *
 * @example
 * ```ts
 * const { isConfirmed, value } = await confirmDialog({ title: 'Delete?' });
 * if (isConfirmed) deleteItem();
 * ```
 */
export interface DialogResult<T = unknown> extends PromiseLike<DialogResultData<T>> {
  id: string;
  open: boolean;
  dismiss: (reason?: DismissReason, value?: T) => void;
  update: (newProps: Record<string, unknown>) => void;
}

export type DismissData<T = unknown> = {
  reason: DismissReason;
  value?: T;
};

type Autocomplete<T extends string> = T | string & {};

type DialogData = Partial<DialogProps> & DialogUserConfig;

type BaseDialogResult<T = unknown> = Omit<DialogResult<T>, 'update'>;

class DialogObservable {
  private subscribers: Array<
    (action: "SHOW_DIALOG" | "HIDE_DIALOG" | "UPDATE_DIALOG", data: DialogData) => void
  > = [];
  private dialogId = 0;
  private pendingDialogs = new Map<
    string,
    { resolve: (value: DialogResultData) => void }
  >();

  subscribe(
    callback: (
      action: "SHOW_DIALOG" | "HIDE_DIALOG" | "UPDATE_DIALOG",
      data: DialogData
    ) => void
  ) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((sub) => sub !== callback);
    };
  }

  private notify(
    action: "SHOW_DIALOG" | "HIDE_DIALOG" | "UPDATE_DIALOG",
    data: DialogData
  ) {
    this.subscribers.forEach((callback) => callback(action, data));
  }

  showDialog<T = unknown>(
    props: Partial<DialogProps<T>> & DialogUserConfig
  ): BaseDialogResult<T> {
    const id = props.id || `dialog-${++this.dialogId}`;

    if (!props.render) {
      throw new Error('Dialog render function is required');
    }

    if (props.singleton && this.pendingDialogs.has(id)) {
      this.dismissDialog(id, 'close');
    }

    let isDialogOpen = true;

    const resultPromise = new Promise<DialogResultData<T>>((resolve) => {
      this.pendingDialogs.set(id, {
        resolve: (data) => {
          isDialogOpen = false;
          resolve(data as DialogResultData<T>);
        },
      });
    });

    this.notify("SHOW_DIALOG", { ...props, id });

    return {
      id,
      get open() { return isDialogOpen; },
      dismiss: (reason: DismissReason = "close", value?: T) => {
        this.dismissDialog(id, reason, value);
      },
      then: <TResult1 = DialogResultData<T>, TResult2 = never>(
        onFulfilled?: ((value: DialogResultData<T>) => TResult1 | PromiseLike<TResult1>) | null,
        onRejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
      ) => resultPromise.then(onFulfilled, onRejected),
    };
  }

  updateDialog(id: string) {
    this.notify("UPDATE_DIALOG", { id });
  }

  confirmDialog(id: string, value?: unknown) {
    const dialog = this.pendingDialogs.get(id);
    if (dialog) {
      dialog.resolve({ id, isConfirmed: true, isDenied: false, isDismissed: false, value });
      this.pendingDialogs.delete(id);
      this.notify("HIDE_DIALOG", { id });
    }
  }

  denyDialog(id: string, value?: unknown) {
    const dialog = this.pendingDialogs.get(id);
    if (dialog) {
      dialog.resolve({ id, isConfirmed: false, isDenied: true, isDismissed: false, value });
      this.pendingDialogs.delete(id);
      this.notify("HIDE_DIALOG", { id });
    }
  }

  dismissDialog(id: string, reason: DismissReason, value?: unknown) {
    const dialog = this.pendingDialogs.get(id);
    if (dialog) {
      dialog.resolve({ id, isConfirmed: false, isDenied: false, isDismissed: true, value, dismissReason: reason });
      this.pendingDialogs.delete(id);
      this.notify("HIDE_DIALOG", { id });
    }
  }

  dismissAllDialogs(reason: DismissReason, value?: unknown) {
    const dialogIds = Array.from(this.pendingDialogs.keys());
    dialogIds.forEach((id) => this.dismissDialog(id, reason, value));
  }
}

export const dialogObservable = new DialogObservable();

type ExtractRendererProps<TProps, TValue> = Omit<TProps, keyof DialogRendererProps<TValue>>;

type IsEmptyObject<T> = keyof T extends never ? true : false;

const DIALOG_CONFIG_KEYS = new Set(['id', 'onOpen', 'onClose', 'singleton']);

function isDialogOptions(arg: unknown): arg is Partial<DialogProps> & DialogUserConfig {
  if (arg === undefined || arg === null) return true;
  if (typeof arg !== 'object') return false;
  return Object.keys(arg as object).every(k => DIALOG_CONFIG_KEYS.has(k));
}

/**
 * Creates a dialog function that can be called with props to show a dialog.
 * The returned result is awaitable — `await` it to get the user's response.
 *
 * @example - Basic usage:
 * ```ts
 * const { isConfirmed } = await confirmDialog({ title: 'Delete?' });
 * ```
 * @example - With custom props:
 * ```ts
 * const CustomComponent = (props: DialogRendererProps<boolean> & { label: string }) => <div>...</div>;
 * const customDialog = dialog(CustomComponent);
 * const { isConfirmed } = await customDialog({ label: 'Confirm' });
 * ```
 * @example - Updating a dialog after showing it:
 * ```ts
 * const result = myDialog({ title: 'Loading...' });
 * result.update({ title: 'Done!' });
 * ```
 * @example - Singleton — replaces any existing dialog with the same ID:
 * ```ts
 * await myDialog({ id: 'confirm' }, { singleton: true });
 * ```
 */
export function dialog<TProps extends DialogRendererProps<TValue>, TValue = TProps extends DialogRendererProps<infer V> ? V : unknown>(
  render: (props: TProps) => React.ReactNode,
  defaultOptions?: Partial<DialogProps<TValue>> & DialogUserConfig
): IsEmptyObject<ExtractRendererProps<TProps, TValue>> extends true
  ? (dialogOptions?: Partial<DialogProps<TValue>> & DialogUserConfig) => DialogResult<TValue>
  : (rendererProps: ExtractRendererProps<TProps, TValue>, dialogOptions?: Partial<DialogProps<TValue>> & DialogUserConfig) => DialogResult<TValue> {
  type RendererProps = ExtractRendererProps<TProps, TValue>;
  return ((
    firstArg?: RendererProps | (Partial<DialogProps<TValue>> & DialogUserConfig),
    secondArg?: Partial<DialogProps<TValue>> & DialogUserConfig
  ): DialogResult<TValue> => {
    let rendererProps: RendererProps;
    let finalDialogOptions: (Partial<DialogProps<TValue>> & DialogUserConfig) | undefined;

    if (secondArg !== undefined) {
      rendererProps = (firstArg as RendererProps) ?? ({} as RendererProps);
      finalDialogOptions = secondArg;
    } else if (isDialogOptions(firstArg)) {
      rendererProps = {} as RendererProps;
      finalDialogOptions = firstArg as Partial<DialogProps<TValue>> & DialogUserConfig;
    } else {
      rendererProps = (firstArg as RendererProps) ?? ({} as RendererProps);
      finalDialogOptions = undefined;
    }

    const rendererPropsRef = { current: rendererProps };
    const mergedOptions = { ...defaultOptions, ...finalDialogOptions };

    const baseResult = dialogObservable.showDialog({
      render: (dialogProps: DialogRendererProps<TValue>) =>
        render({ ...dialogProps, ...rendererPropsRef.current } as TProps),
      onOpen: () => {},
      onClose: () => {},
      ...mergedOptions,
    });

    return {
      get id() { return baseResult.id; },
      get open() { return baseResult.open; },
      dismiss: baseResult.dismiss,
      then: baseResult.then,
      update: (newProps: Record<string, unknown>) => {
        rendererPropsRef.current = { ...rendererPropsRef.current, ...newProps } as RendererProps;
        dialogObservable.updateDialog(baseResult.id);
      },
    };
  }) as unknown as IsEmptyObject<ExtractRendererProps<TProps, TValue>> extends true
    ? (dialogOptions?: Partial<DialogProps<TValue>> & DialogUserConfig) => DialogResult<TValue>
    : (rendererProps: ExtractRendererProps<TProps, TValue>, dialogOptions?: Partial<DialogProps<TValue>> & DialogUserConfig) => DialogResult<TValue>;
}

const dismissDialog = (id?: string, reason: DismissReason = "close", value?: unknown) => {
  if (id) {
    dialogObservable.dismissDialog(id, reason, value);
  } else {
    dialogObservable.dismissAllDialogs(reason, value);
  }
};

dialog.dismiss = dismissDialog;

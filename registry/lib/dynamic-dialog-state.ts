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

export interface DialogResult<T = unknown> {
  id: string;
  isConfirmed: boolean;
  isDenied: boolean;
  isDismissed: boolean;
  open: boolean;
  /** Resolved value — undefined until the dialog closes. Use `.async()` to await. */
  value: T | undefined;
  dismissReason?: DismissReason;
  dismiss: (reason?: DismissReason, value?: T) => void;
  /** Update renderer props on an open dialog, triggering a re-render. */
  update: (newProps: Record<string, unknown>) => void;
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
    {
      resolve: (value: {
        id: string;
        isConfirmed: boolean;
        isDenied: boolean;
        isDismissed: boolean;
        value?: unknown;
        dismissReason?: DismissReason;
      }) => void;
    }
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

  showDialog<ReturnValue = unknown>(
    props: Partial<DialogProps<ReturnValue>> & DialogUserConfig
  ): BaseDialogResult<ReturnValue> {
    const id = props.id || `dialog-${++this.dialogId}`;

    if (!props.render) {
      throw new Error('Dialog render function is required');
    }

    if (props.singleton && this.pendingDialogs.has(id)) {
      this.dismissDialog(id, 'close');
    }

    let resolvedData: {
      isConfirmed: boolean;
      isDenied: boolean;
      isDismissed: boolean;
      value?: ReturnValue;
      dismissReason?: DismissReason;
    } | null = null;
    let isDialogOpen = true;

    const valuePromise = new Promise<ReturnValue | undefined>((resolve) => {
      this.pendingDialogs.set(id, {
        resolve: (result) => {
          resolvedData = {
            isConfirmed: result.isConfirmed,
            isDenied: result.isDenied,
            isDismissed: result.isDismissed,
            value: result.value as ReturnValue,
            dismissReason: result.dismissReason,
          };
          isDialogOpen = false;
          resolve(result.value as ReturnValue);
        },
      });
    });

    const dismissFn = (reason: DismissReason = "close", value?: ReturnValue) => {
      this.dismissDialog(id, reason, value);
    };

    this.notify("SHOW_DIALOG", { ...props, id });

    const asyncFn = async () => {
      await valuePromise;
      return {
        id,
        isConfirmed: resolvedData?.isConfirmed ?? false,
        isDenied: resolvedData?.isDenied ?? false,
        isDismissed: resolvedData?.isDismissed ?? false,
        value: resolvedData?.value,
        dismissReason: resolvedData?.dismissReason,
      };
    };

    return {
      id,
      get isConfirmed() { return resolvedData?.isConfirmed ?? false; },
      get isDenied() { return resolvedData?.isDenied ?? false; },
      get isDismissed() { return resolvedData?.isDismissed ?? false; },
      get open() { return isDialogOpen; },
      get value() { return resolvedData?.value; },
      get dismissReason() { return resolvedData?.dismissReason; },
      dismiss: dismissFn,
      async: asyncFn,
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
 *
 * @param render - A function that takes dialog properties and returns a React node.
 * @param defaultOptions - Default dialog configuration options.
 * @returns A function that accepts renderer props and dialog options to show the dialog.
 *
 * @example - Basic usage with a custom renderer:
 * ```ts
 * const CustomComponent = (props: DialogRendererProps<boolean> & { customProp: string }) => <div>...</div>;
 * const customDialog = dialog(CustomComponent);
 * const result = customDialog({ customProp: 'value' }); // TypeScript knows customProp is required!
 * const { isConfirmed, value } = await result.async();
 * ```
 * @example - Usage with no custom props:
 * ```ts
 * const ExampleComponent = (props: DialogRendererProps<string>) => <div>...</div>;
 * const asyncDialog = dialog(ExampleComponent);
 * const result = asyncDialog({ id: 'my-dialog' });
 * const { isConfirmed } = await result.async();
 * ```
 * @example - Updating a dialog after showing it:
 * ```ts
 * const result = myDialog({ title: 'Loading...' });
 * result.update({ title: 'Done!' });
 * ```
 * @example - Singleton — replaces any existing dialog with the same ID:
 * ```ts
 * const result = myDialog({ id: 'confirm' }, { singleton: true });
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
      get isConfirmed() { return baseResult.isConfirmed; },
      get isDenied() { return baseResult.isDenied; },
      get isDismissed() { return baseResult.isDismissed; },
      get open() { return baseResult.open; },
      get value() { return baseResult.value; },
      get dismissReason() { return baseResult.dismissReason; },
      dismiss: baseResult.dismiss,
      async: baseResult.async,
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

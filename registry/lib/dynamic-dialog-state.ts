import * as DialogPrimitive from "@radix-ui/react-dialog"
import React from 'react';
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
  dialogContentProps?: DialogPrimitive.DialogContentProps;
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

type Autocomplete<T extends string> = T | string & {}

type DialogData = Partial<DialogProps> & DialogUserConfig;

class DialogObservable {
  private subscribers: Array<
    (action: "SHOW_DIALOG" | "HIDE_DIALOG", data: DialogData) => void
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
      action: "SHOW_DIALOG" | "HIDE_DIALOG",
      data: DialogData
    ) => void
  ) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((sub) => sub !== callback);
    };
  }

  private notify(
    action: "SHOW_DIALOG" | "HIDE_DIALOG",
    data: DialogData
  ) {
    this.subscribers.forEach((callback) =>
      callback(action, data)
    );
  }

  showDialog<ReturnValue = unknown>(
    props: Partial<DialogProps<ReturnValue>> & DialogUserConfig
  ): DialogResult<ReturnValue> {
    const id = props.id || `dialog-${++this.dialogId}`;

    if (!props.render) {
      throw new Error('Dialog render function is required');
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
        resolve: (result: {
          id: string;
          isConfirmed: boolean;
          isDenied: boolean;
          isDismissed: boolean;
          value?: unknown;
          dismissReason?: DismissReason;
        }) => {
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

    const dismissFn = (
      reason: DismissReason = "close",
      value?: ReturnValue
    ) => {
      this.dismissDialog(id, reason, value);
    };

    this.notify("SHOW_DIALOG", {
      ...props,
      id,
      render: props.render,
    });

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
      get isConfirmed() {
        return resolvedData?.isConfirmed ?? false;
      },
      get isDenied() {
        return resolvedData?.isDenied ?? false;
      },
      get isDismissed() {
        return resolvedData?.isDismissed ?? false;
      },
      get open() {
        return isDialogOpen;
      },
      value: valuePromise,
      get dismissReason() {
        return resolvedData?.dismissReason;
      },
      dismiss: dismissFn,
      async: asyncFn,
    };
  }

  confirmDialog(id: string, value?: unknown) {
    const dialog = this.pendingDialogs.get(id);
    if (dialog) {
      dialog.resolve({
        id,
        isConfirmed: true,
        isDenied: false,
        isDismissed: false,
        value,
      });
      this.pendingDialogs.delete(id);
      this.notify("HIDE_DIALOG", { id });
    }
  }

  denyDialog(id: string, value?: unknown) {
    const dialog = this.pendingDialogs.get(id);
    if (dialog) {
      dialog.resolve({
        id,
        isConfirmed: false,
        isDenied: true,
        isDismissed: false,
        value,
      });
      this.pendingDialogs.delete(id);
      this.notify("HIDE_DIALOG", { id });
    }
  }

  dismissDialog(id: string, reason: DismissReason, value?: unknown) {
    const dialog = this.pendingDialogs.get(id);
    if (dialog) {
      dialog.resolve({
        id,
        isConfirmed: false,
        isDenied: false,
        isDismissed: true,
        value,
        dismissReason: reason,
      });
      this.pendingDialogs.delete(id);
      this.notify("HIDE_DIALOG", { id });
    }
  }

  dismissAllDialogs(reason: DismissReason, value?: unknown) {
    // Get all current dialog IDs
    const dialogIds = Array.from(this.pendingDialogs.keys());

    // Dismiss each dialog
    dialogIds.forEach((id) => {
      this.dismissDialog(id, reason, value);
    });
  }
}

export const dialogObservable = new DialogObservable();



/**
 * Creates a dialog function that can be called with props to show a dialog.
 *
 * @param render - A function that takes dialog properties and returns a React node.
 * @param defaultOptions - Default dialog configuration options.
 * @typeParam RendererProps - Additional properties to be passed to the React Component. This type is merged with DialogRendererProps.
 * @typeParam TValue - The type of value that the dialog will return upon resolving.
 * @returns A function that accepts renderer props and dialog options to show the dialog.
 *
 * @example - Basic usage with a custom renderer:
 * ```ts
 * const customDialog = dialog<{ customProp: string }, boolean>(CustomComponent, {important: true});
 * const result = customDialog({ customProp: 'value' });
 * const value = result.value; // Promise<boolean>
 * const awaitedValue = await value; // boolean
 * const isConfirmed = result.isConfirmed; // boolean
 * ```
 * @example - Usage with dialog props for control:
 * ```ts
 * const asyncDialog = dialog<{}, string>(ExampleComponent);
 * const result = asyncDialog({}, { id: 'my-dialog', important: true });
 * const value = result.value; // string
 * const isConfirmed = result.isConfirmed; // boolean
 * ```
 * @example - Dismissing a dialog using dismiss helper:
 * ```ts
 * const exampleDialog = dialog<{}, void>(ExampleComponent);
 * const result = exampleDialog();
 * // Dismiss the dialog after 2 seconds
 * setTimeout(() => {
 *   result.dismiss();
 * }, 2000);
 * ```
 */
export const dialog = <RendererProps = unknown, TValue = unknown>(
  render: (props: DialogRendererProps<TValue> & RendererProps) => React.ReactNode,
  defaultOptions?: Partial<DialogProps<TValue>> & DialogUserConfig
) => {
  return (
    rendererProps: RendererProps,
    dialogOptions?: Partial<DialogProps<TValue>> & DialogUserConfig
  ): DialogResult<TValue> => {
    const mergedOptions = { ...defaultOptions, ...dialogOptions };

    return dialogObservable.showDialog({
      render: (dialogProps: DialogRendererProps<TValue>) =>
        render({ ...dialogProps, ...rendererProps } as DialogRendererProps<TValue> & RendererProps),
      onOpen: () => {},
      onClose: () => {},
      ...mergedOptions
    });
  };
};

const dismissDialog = (id?: string, reason: DismissReason = "close", value?: unknown) => {
  if (id) {
    dialogObservable.dismissDialog(id, reason, value);
  } else {
    dialogObservable.dismissAllDialogs(reason, value);
  }
}

/**
 * Dismiss a dialog by ID or all dialogs at once.
 * @param id - Optional dialog ID, if not provided all dialogs will be dismissed.
 * @param reason - The reason for dismissing the dialog.
 * @param value - Optional value to pass when dismissing the dialog.
 * @example - Dismiss a specific dialog by ID:
 * ```ts
 * const exampleDialog = exampleDialog();
 * dialog.dismiss(exampleDialog.id, "cancel", { some: 'data' });
 * ```
 * @example - Dismiss all dialogs at once:
 * ```ts
 * dialog.dismiss(undefined, "cancel", { some: 'data' });
 * // or simply
 * dialog.dismiss();
 * ```
 */
dialog.dismiss = dismissDialog;

dialog.confirm = confirm;
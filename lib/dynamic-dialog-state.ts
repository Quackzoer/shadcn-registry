import React from "react";

type BuiltInDismissReason = "cancel" | "close" | "time-out" | "success" | "error";

// Extension point — users augment this interface to add custom dismiss reasons:
// declare module '@/lib/dynamic-dialog-state' {
//   interface DismissReasonRegistry { 'my-reason': true }
// }
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DismissReasonRegistry {}

export type DismissReason = BuiltInDismissReason | keyof DismissReasonRegistry;

// When T is a concrete type, confirm requires a value. When T is void or unknown (unspecified), value is optional.
type ConfirmFn<T> =
  [T] extends [void] ? () => void :
  unknown extends T ? (value?: T) => void :
  (value: T) => void;

export interface DialogActions<T = unknown> {
  confirm: ConfirmFn<T>;
  dismiss: (reason?: DismissReason, value?: T) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export type DialogComponentProps<TProps, TValue = void> = TProps &
  DialogActions<TValue>;

export type DialogOptions = {
  id?: string;
  singleton?: boolean;
  /** Return false (or Promise<false>) to prevent the dialog from closing when the user triggers a close gesture. Does not block programmatic dismiss(). */
  beforeClose?: () => boolean | Promise<boolean>;
};

export interface DialogResultData<T = unknown> {
  id: string;
  confirmed: boolean;
  value?: T;
  reason?: DismissReason;
}

export interface DialogResult<TValue = unknown, TProps = Record<string, unknown>> extends PromiseLike<
  DialogResultData<TValue>
> {
  id: string;
  dismiss: (reason?: DismissReason, value?: TValue) => void;
  update: (newProps: Partial<TProps>) => void;
}

type PendingDialog = {
  resolve: (value: DialogResultData) => void;
  componentProps: Record<string, unknown>;
};

type AnyComponentType = React.ComponentType<Record<string, unknown>>;

type DialogEvent =
  | { action: "SHOW_DIALOG"; id: string; Component: AnyComponentType; componentProps: Record<string, unknown>; beforeClose?: () => boolean | Promise<boolean> }
  | { action: "UPDATE_DIALOG"; id: string; componentProps: Record<string, unknown> }
  | { action: "HIDE_DIALOG"; id: string };

type DialogSubscriber = (event: DialogEvent) => void;

class DialogObservable {
  private subscribers: DialogSubscriber[] = [];
  private dialogId = 0;
  private pendingDialogs = new Map<string, PendingDialog>();

  subscribe(callback: DialogSubscriber) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== callback);
    };
  }

  private notify(event: DialogEvent) {
    this.subscribers.forEach((cb) => cb(event));
  }

  getPendingIds(): string[] {
    return Array.from(this.pendingDialogs.keys());
  }

  hasPending(id: string): boolean {
    return this.pendingDialogs.has(id);
  }

  showDialog<T>(
    Component: AnyComponentType,
    componentProps: Record<string, unknown>,
    options: DialogOptions,
  ): DialogResult<T, Record<string, unknown>> {
    const id = options.id ?? `dialog-${++this.dialogId}`;

    if (options.singleton && this.pendingDialogs.has(id)) {
      this.dismissDialog(id, "close");
    }

    const resultPromise = new Promise<DialogResultData<T>>((resolve) => {
      this.pendingDialogs.set(id, {
        resolve: (data) => resolve(data as DialogResultData<T>),
        componentProps,
      });
    });

    this.notify({ action: "SHOW_DIALOG", id, Component, componentProps, beforeClose: options.beforeClose });

    return {
      id,
      dismiss: (reason: DismissReason = "close", value?: T) =>
        this.dismissDialog(id, reason, value),
      then: (onFulfilled, onRejected) =>
        resultPromise.then(onFulfilled, onRejected),
      update: (newProps: Partial<Record<string, unknown>>) =>
        this.updateDialog(id, newProps),
    };
  }

  updateDialog(id: string, newProps: Record<string, unknown>) {
    const dialog = this.pendingDialogs.get(id);
    if (!dialog) return;
    dialog.componentProps = { ...dialog.componentProps, ...newProps };
    this.notify({ action: "UPDATE_DIALOG", id, componentProps: dialog.componentProps });
  }

  confirmDialog(id: string, value?: unknown) {
    const dialog = this.pendingDialogs.get(id);
    if (!dialog) return;
    dialog.resolve({ id, confirmed: true, value });
    this.pendingDialogs.delete(id);
    this.notify({ action: "HIDE_DIALOG", id });
  }

  dismissDialog(id: string, reason: DismissReason = "close", value?: unknown) {
    const dialog = this.pendingDialogs.get(id);
    if (!dialog) return;
    dialog.resolve({ id, confirmed: false, value, reason });
    this.pendingDialogs.delete(id);
    this.notify({ action: "HIDE_DIALOG", id });
  }

  dismissAllDialogs(reason: DismissReason = "close", value?: unknown) {
    Array.from(this.pendingDialogs.keys()).forEach((id) =>
      this.dismissDialog(id, reason, value),
    );
  }
}

export const dialogObservable = new DialogObservable();

type OwnProps<TProps, TValue> = Omit<TProps, keyof DialogActions<TValue>>;

export function dialog<
  TProps extends DialogActions<TValue>,
  TValue = TProps extends DialogActions<infer V> ? V : unknown,
>(
  Component: React.ComponentType<TProps>,
  defaultOptions?: DialogOptions,
): (arg?: {
  props?: OwnProps<TProps, TValue>;
  options?: DialogOptions;
}) => DialogResult<TValue, OwnProps<TProps, TValue>> {
  return (arg) => {
    const componentProps = (arg?.props ?? {}) as Record<string, unknown>;
    const options: DialogOptions = { ...defaultOptions, ...arg?.options };
    const baseResult = dialogObservable.showDialog<TValue>(
      Component as AnyComponentType,
      componentProps,
      options,
    );
    return {
      id: baseResult.id,
      dismiss: baseResult.dismiss,
      then: baseResult.then,
      update: (newProps: Partial<OwnProps<TProps, TValue>>) =>
        dialogObservable.updateDialog(baseResult.id, newProps as Record<string, unknown>),
    };
  };
}

dialog.dismiss = (
  id?: string,
  reason: DismissReason = "close",
  value?: unknown,
) => {
  if (id) dialogObservable.dismissDialog(id, reason, value);
  else dialogObservable.dismissAllDialogs(reason, value);
};

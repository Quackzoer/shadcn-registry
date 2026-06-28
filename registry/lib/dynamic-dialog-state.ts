import React from 'react';

export interface DialogActions<T = unknown> {
  confirm: (value?: T) => void;
  dismiss: (reason?: string, value?: T) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export type DialogComponentProps<TProps, TValue = void> = TProps & DialogActions<TValue>;

export type DialogOptions = {
  id?: string;
  singleton?: boolean;
};

export interface DialogResultData<T = unknown> {
  id: string;
  confirmed: boolean;
  value?: T;
  reason?: string;
}

export interface DialogResult<T = unknown> extends PromiseLike<DialogResultData<T>> {
  id: string;
  dismiss: (reason?: string, value?: T) => void;
  update: (newProps: Record<string, unknown>) => void;
}

type PendingDialog = {
  resolve: (value: DialogResultData) => void;
  componentProps: Record<string, unknown>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySubscriber = (action: 'SHOW_DIALOG' | 'UPDATE_DIALOG' | 'HIDE_DIALOG', data: any) => void;

class DialogObservable {
  private subscribers: AnySubscriber[] = [];
  private dialogId = 0;
  private pendingDialogs = new Map<string, PendingDialog>();

  subscribe(callback: AnySubscriber) {
    this.subscribers.push(callback);
    return () => { this.subscribers = this.subscribers.filter(s => s !== callback); };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private notify(action: 'SHOW_DIALOG' | 'UPDATE_DIALOG' | 'HIDE_DIALOG', data: any) {
    this.subscribers.forEach(cb => cb(action, data));
  }

  showDialog<T>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Component: React.ComponentType<any>,
    componentProps: Record<string, unknown>,
    options: DialogOptions
  ): Omit<DialogResult<T>, 'update'> {
    const id = options.id ?? `dialog-${++this.dialogId}`;

    if (options.singleton && this.pendingDialogs.has(id)) {
      this.dismissDialog(id, 'close');
    }

    const resultPromise = new Promise<DialogResultData<T>>(resolve => {
      this.pendingDialogs.set(id, {
        resolve: data => resolve(data as DialogResultData<T>),
        componentProps,
      });
    });

    this.notify('SHOW_DIALOG', { id, Component, componentProps });

    return {
      id,
      dismiss: (reason = 'close', value?: T) => this.dismissDialog(id, reason, value),
      then: (onFulfilled, onRejected) => resultPromise.then(onFulfilled, onRejected),
    };
  }

  updateDialog(id: string, newProps: Record<string, unknown>) {
    const dialog = this.pendingDialogs.get(id);
    if (!dialog) return;
    dialog.componentProps = { ...dialog.componentProps, ...newProps };
    this.notify('UPDATE_DIALOG', { id, componentProps: dialog.componentProps });
  }

  confirmDialog(id: string, value?: unknown) {
    const dialog = this.pendingDialogs.get(id);
    if (!dialog) return;
    dialog.resolve({ id, confirmed: true, value });
    this.pendingDialogs.delete(id);
    this.notify('HIDE_DIALOG', { id });
  }

  dismissDialog(id: string, reason = 'close', value?: unknown) {
    const dialog = this.pendingDialogs.get(id);
    if (!dialog) return;
    dialog.resolve({ id, confirmed: false, value, reason });
    this.pendingDialogs.delete(id);
    this.notify('HIDE_DIALOG', { id });
  }

  dismissAllDialogs(reason = 'close', value?: unknown) {
    Array.from(this.pendingDialogs.keys()).forEach(id => this.dismissDialog(id, reason, value));
  }
}

export const dialogObservable = new DialogObservable();

type OwnProps<TProps, TValue> = Omit<TProps, keyof DialogActions<TValue>>;

export function dialog<TProps extends DialogActions<TValue>, TValue = TProps extends DialogActions<infer V> ? V : unknown>(
  Component: React.ComponentType<TProps>,
  defaultOptions?: DialogOptions
): (arg?: { props?: OwnProps<TProps, TValue>; options?: DialogOptions }) => DialogResult<TValue> {
  return (arg) => {
    const componentProps = (arg?.props ?? {}) as Record<string, unknown>;
    const options: DialogOptions = { ...defaultOptions, ...arg?.options };
    const baseResult = dialogObservable.showDialog<TValue>(Component, componentProps, options);
    return {
      id: baseResult.id,
      dismiss: baseResult.dismiss,
      then: baseResult.then,
      update: (newProps) => dialogObservable.updateDialog(baseResult.id, newProps),
    };
  };
}

dialog.dismiss = (id?: string, reason = 'close', value?: unknown) => {
  if (id) dialogObservable.dismissDialog(id, reason, value);
  else dialogObservable.dismissAllDialogs(reason, value);
};
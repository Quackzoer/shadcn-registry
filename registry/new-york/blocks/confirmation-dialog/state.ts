import type { DialogProps, DialogResult, DismissReason } from './types';

export class DialogObservable {
  private subscribers: Array<(action: string, data: unknown) => void> = [];
  private dialogId = 0;
  private pendingDialogs = new Map<string, { resolve: (value: DialogResult) => void;  }>();

  subscribe(callback: (action: string, data: unknown) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notify(action: string, data: unknown) {
    this.subscribers.forEach(callback => callback(action, data));
  }

  async showDialog<T>(props: Partial<DialogProps<T>>): Promise<DialogResult> {
    const id = `dialog-${++this.dialogId}`;

    return new Promise((resolve) => {
      this.pendingDialogs.set(id, { resolve });

      this.notify('SHOW_DIALOG', {
        id,
        ...props,
      });
    });
  }

  confirmDialog(id: string, value?: unknown) {
    const dialog = this.pendingDialogs.get(id);
    if (dialog) {
      dialog.resolve({
        isConfirmed: true,
        isDenied: false,
        isDismissed: false,
        value,
      });
      this.pendingDialogs.delete(id);
      this.notify('HIDE_DIALOG', { id });
    }
  }

  denyDialog(id: string, value?: unknown) {
    const dialog = this.pendingDialogs.get(id);
    if (dialog) {
      dialog.resolve({
        isConfirmed: false,
        isDenied: true,
        isDismissed: false,
        value,
      });
      this.pendingDialogs.delete(id);
      this.notify('HIDE_DIALOG', { id });
    }
  }

  dismissDialog(id: string, reason: DismissReason, value?: unknown) {
    const dialog = this.pendingDialogs.get(id);
    if (dialog) {
      dialog.resolve({
        isConfirmed: false,
        isDenied: false,
        isDismissed: true,
        value,
        dismiss: reason,
      });
      this.pendingDialogs.delete(id);
      this.notify('HIDE_DIALOG', { id });
    }
  }
}

export const dialogObservable = new DialogObservable();
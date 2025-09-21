import type { DialogProps, DialogResult, DismissReason } from './types';

export class DialogObservable {
  private subscribers: Array<(action: 'SHOW_DIALOG' | 'HIDE_DIALOG', data: DialogProps) => void> = [];
  private dialogId = 0;
  private pendingDialogs = new Map<string, { resolve: (value: DialogResult<any>) => void;  }>();

  subscribe(callback: (action: 'SHOW_DIALOG' | 'HIDE_DIALOG', data: DialogProps) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notify(action: 'SHOW_DIALOG' | 'HIDE_DIALOG', data: DialogProps) {
    this.subscribers.forEach(callback => callback(action, data));
  }

  async showDialog<T>(props: Partial<DialogProps<T>>): Promise<DialogResult<T>> {
    const id = props.id || `dialog-${++this.dialogId}`;

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
        id,
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
        id,
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
        id,
        isConfirmed: false,
        isDenied: false,
        isDismissed: true,
        value,
        dismissReason: reason,
      });
      this.pendingDialogs.delete(id);
      this.notify('HIDE_DIALOG', { id });
    }
  }

  dismissAllDialogs(reason: DismissReason, value?: unknown) {
    // Get all current dialog IDs
    const dialogIds = Array.from(this.pendingDialogs.keys());

    // Dismiss each dialog
    dialogIds.forEach(id => {
      this.dismissDialog(id, reason, value);
    });
  }
}

export const dialogObservable = new DialogObservable();
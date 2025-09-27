import type {
  DialogProps,
  DialogResult,
} from "@/registry/new-york/lib/dynamic-dialog/types";
import { DismissReason } from "@/registry/new-york/lib/dynamic-dialog/types";

export class DialogObservable {
  private subscribers: Array<
    (action: "SHOW_DIALOG" | "HIDE_DIALOG", data: Partial<DialogProps>) => void
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
      data: Partial<DialogProps>
    ) => void
  ) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((sub) => sub !== callback);
    };
  }

  private notify<Props = unknown, ReturnValue = unknown>(
    action: "SHOW_DIALOG" | "HIDE_DIALOG",
    data: Partial<DialogProps<ReturnValue>> & Props
  ) {
    this.subscribers.forEach((callback) =>
      callback(action, data as Partial<DialogProps>)
    );
  }

  showDialog<
    Props extends Partial<DialogProps<unknown>>,
    ReturnValue = unknown
  >(props: Props): DialogResult<ReturnValue> {
    const id = props.id || `dialog-${++this.dialogId}`;

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
      reason: DismissReason = DismissReason.CLOSE,
      value?: ReturnValue
    ) => {
      this.dismissDialog(id, reason, value);
    };

    this.notify<Props>("SHOW_DIALOG", {
      id,
      ...props,
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

"use client"

import { dialog, type DialogComponentProps } from '@/registry/lib/dynamic-dialog-state';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/registry/ui/dialog";

export interface LoadingDialogProps {
  title?: string;
  description?: string;
  /** Allow the user to dismiss the dialog via Escape, outside click, or the close button. Defaults to false. */
  allowCancel?: boolean;
}

export function LoadingDialog(props: DialogComponentProps<LoadingDialogProps>) {
  const nonCancellable = !props.allowCancel;

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent
        showCloseButton={!nonCancellable}
        onEscapeKeyDown={e => { if (nonCancellable) e.preventDefault(); }}
        onPointerDownOutside={e => { if (nonCancellable) e.preventDefault(); }}
        onInteractOutside={e => { if (nonCancellable) e.preventDefault(); }}
      >
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 flex-shrink-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <div>
              <DialogTitle>{props.title ?? "Loading..."}</DialogTitle>
              {props.description && (
                <DialogDescription>{props.description}</DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export const loadingDialog = dialog(LoadingDialog);

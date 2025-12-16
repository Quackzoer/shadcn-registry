"use client"

import { useState, useEffect } from 'react';
import type { DialogState, DialogRendererProps, DismissReason } from '@/registry/lib/dynamic-dialog-state';
import { dialogObservable } from '@/registry/lib/dynamic-dialog-state';
import { Dialog } from '@/registry/ui/dialog';
import { AlertDialog } from '../alert-dialog';

function DynamicDialog(props: Readonly<DialogState>) {

  useEffect(() => {
    props.onOpen();
    return () => props.onClose();
  }, [props]);

  const confirm = (value?: unknown) => {
    dialogObservable.confirmDialog(props.id, value);
  };

  const deny = (value?: unknown) => {
    dialogObservable.denyDialog(props.id, value);
  };

  const cancel = () => {
    dialogObservable.dismissDialog(props.id, "cancel");
  };

  const dismiss = (reason: DismissReason, value?: unknown) => {
    dialogObservable.dismissDialog(props.id, reason, value);
  };

  const closeDialog = () => {
    dialogObservable.dismissDialog(props.id, "close");
  };

  const renderProps: DialogRendererProps = {
    ...props,
    confirm,
    deny,
    cancel,
    dismiss,
    closeDialog
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <AlertDialog open={props.open} onOpenChange={props.onOpenChange}>
        {props.render?.(renderProps)}
      </AlertDialog>
    </Dialog>
  );
}

export function DynamicDialogProvider() {
  const [dialogs, setDialogs] = useState<DialogState[]>([]);

  useEffect(() => {
    const unsubscribe = dialogObservable.subscribe((action, data) => {
      switch (action) {
        case 'SHOW_DIALOG': {
          const dialogState: DialogState = {
            ...data,
            id: data.id!,
            render: data.render!,
            open: true,
            onOpen: data.onOpen || (() => { }),
            onClose: data.onClose || (() => { }),
            onOpenChange: (open: boolean) => {
              if (!open) {
                dialogObservable.dismissDialog(data.id!, "close");
              }
            }
          };
          setDialogs(current => [...current, dialogState]);
          break;
        }
        case 'HIDE_DIALOG': {
          setDialogs(current => current.filter(d => d.id !== data.id));
          break;
        }
      }
    });

    return unsubscribe;
  }, []);

  return (
    <>
      {dialogs.map(dialog => (
        <DynamicDialog
          key={dialog.id}
          {...dialog}
        />
      ))}
    </>
  );
}
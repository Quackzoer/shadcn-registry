"use client"

import { useState, useEffect } from 'react';
import { type DialogState, DialogRendererProps, DismissReason } from '@/registry/new-york/lib/dynamic-dialog/types';
import { dialogObservable } from '@/registry/new-york/lib/dynamic-dialog/state';
import { Dialog, DialogContent } from '@/registry/new-york/ui/dialog';

function DynamicDialog(props: DialogState) {

  useEffect(() => {
    props.onOpen();
    return () => props.onClose();
  }, [props]);

  const handleBackdropClick = () => {
    dialogObservable.dismissDialog(props.id, DismissReason.BACKDROP_CLICK);
  };

  const confirm = (value?: unknown) => {
    dialogObservable.confirmDialog(props.id, value);
  };

  const deny = (value?: unknown) => {
    dialogObservable.denyDialog(props.id, value);
  };

  const cancel = () => {
    dialogObservable.dismissDialog(props.id, DismissReason.CANCEL);
  };

  const dismiss = (reason: DismissReason, value?: unknown) => {
    dialogObservable.dismissDialog(props.id, reason, value);
  };

  const closeDialog = () => {
    dialogObservable.dismissDialog(props.id, DismissReason.CLOSE);
  };

  const renderProps: DialogRendererProps = {
    ...props,
    confirm,
    deny,
    cancel,
    dismiss,
    closeDialog,
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent
        onInteractOutside={e => {
          if (props.important) { e.preventDefault() } else { handleBackdropClick() }
        }}
      >
        {props.render && props.render(renderProps)}
      </DialogContent>
    </Dialog>
  );
}

export function DialogProvider() {
  const [dialogs, setDialogs] = useState<DialogState[]>([]);

  useEffect(() => {
    const unsubscribe = dialogObservable.subscribe((action, data) => {
      switch (action) {
        case 'SHOW_DIALOG':
          const dialogState: DialogState = {
            ...data,
            id: data.id!,
            render: data.render!,
            open: true,
            onOpen: data.onOpen || (() => {}),
            onClose: data.onClose || (() => {}),
            onOpenChange: (open: boolean) => {
              if (!open) {
                dialogObservable.dismissDialog(data.id!, DismissReason.CLOSE);
              }
            }
          };
          setDialogs(current => [...current, dialogState]);
          break;
        case 'HIDE_DIALOG':
          setDialogs(current => current.filter(d => d.id !== data.id));
          break;
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
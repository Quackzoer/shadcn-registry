"use client"

import { useState, useEffect, useRef } from 'react';
import type { DialogState, DialogRendererProps, DismissReason } from '@/registry/lib/dynamic-dialog-state';
import { dialogObservable } from '@/registry/lib/dynamic-dialog-state';
import { Dialog } from '@/registry/ui/dialog';
import { AlertDialog } from '../alert-dialog';

function DynamicDialog(props: Readonly<DialogState>) {
  const onOpenRef = useRef(props.onOpen);
  const onCloseRef = useRef(props.onClose);
  onOpenRef.current = props.onOpen;
  onCloseRef.current = props.onClose;

  useEffect(() => {
    onOpenRef.current();
    return () => { onCloseRef.current(); };
  }, []);

  const confirm = (value?: unknown) => dialogObservable.confirmDialog(props.id, value);
  const deny = (value?: unknown) => dialogObservable.denyDialog(props.id, value);
  const dismiss = (reason: DismissReason, value?: unknown) => dialogObservable.dismissDialog(props.id, reason, value);

  const renderProps: DialogRendererProps = {
    confirm,
    deny,
    dismiss,
    onOpen: props.onOpen,
    onClose: props.onClose,
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
            _version: 0,
            onOpen: data.onOpen || (() => {}),
            onClose: data.onClose || (() => {}),
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
        case 'UPDATE_DIALOG': {
          setDialogs(current =>
            current.map(d => d.id === data.id ? { ...d, _version: d._version + 1 } : d)
          );
          break;
        }
      }
    });

    return unsubscribe;
  }, []);

  return (
    <>
      {dialogs.map(dialog => (
        <DynamicDialog key={dialog.id} {...dialog} />
      ))}
    </>
  );
}

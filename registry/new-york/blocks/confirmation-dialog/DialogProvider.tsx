"use client"

import { useState, useEffect } from 'react';
import type { DialogProps } from './types';
import { dialogObservable } from './state';
import { type DialogAction, DismissReason } from './types';
import { Dialog } from '@/registry/new-york/ui/dialog';

function ConfirmationDialog(props: DialogProps) {

  useEffect(() => {
    props.onOpen?.();
    return () => props.onClose?.();
  }, [props]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !props.important) {
      dialogObservable.dismissDialog(props.id, DismissReason.BACKDROP_CLICK);
    }
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

  const renderProps: DialogProps = {
    ...props,
    confirm,
    deny,
    cancel,
    dismiss,
    closeDialog,
  };

  return (
    <Dialog >
      
    </Dialog>
  );
}

export function DialogProvider() {
  const [dialogs, setDialogs] = useState<DialogProps[]>([]);

  useEffect(() => {
    const unsubscribe = dialogObservable.subscribe((action, data) => {
      switch (action) {
        case 'SHOW_DIALOG':
          setDialogs(current => [...current, data]);
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
        <ConfirmationDialog
          key={dialog.id}
          {...dialog}
        />
      ))}
    </>
  );
}
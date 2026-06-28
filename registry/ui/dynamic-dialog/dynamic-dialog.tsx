"use client"

import React, { useState, useEffect } from 'react';
import { dialogObservable } from '@/registry/lib/dynamic-dialog-state';
import type { DialogActions } from '@/registry/lib/dynamic-dialog-state';

interface DialogStateItem {
  id: string;
  open: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: React.ComponentType<any>;
  componentProps: Record<string, unknown>;
}

function DynamicDialogItem({ id, open, Component, componentProps }: DialogStateItem) {
  const confirm = (value?: unknown) => dialogObservable.confirmDialog(id, value);
  const dismiss = (reason?: string, value?: unknown) => dialogObservable.dismissDialog(id, reason, value);
  const onOpenChange = (isOpen: boolean) => { if (!isOpen) dismiss('close'); };

  const actions: DialogActions = { confirm, dismiss, open, onOpenChange };

  return <Component {...componentProps} {...actions} />;
}

export function DynamicDialogProvider() {
  const [dialogs, setDialogs] = useState<DialogStateItem[]>([]);

  useEffect(() => {
    return dialogObservable.subscribe((action, data) => {
      switch (action) {
        case 'SHOW_DIALOG':
          setDialogs(prev => [...prev, {
            id: data.id,
            open: true,
            Component: data.Component,
            componentProps: data.componentProps,
          }]);
          break;
        case 'UPDATE_DIALOG':
          setDialogs(prev =>
            prev.map(d => d.id === data.id ? { ...d, componentProps: data.componentProps } : d)
          );
          break;
        case 'HIDE_DIALOG':
          setDialogs(prev =>
            prev.map(d => d.id === data.id ? { ...d, open: false } : d)
          );
          setTimeout(() => {
            setDialogs(prev => prev.filter(d => d.id !== data.id));
          }, 300);
          break;
      }
    });
  }, []);

  return (
    <>
      {dialogs.map(d => (
        <DynamicDialogItem key={d.id} {...d} />
      ))}
    </>
  );
}

"use client"

import React, { useState, useEffect, useContext, createContext } from 'react';
import { dialogObservable } from '@/registry/lib/dynamic-dialog-state';
import type { DialogActions, DismissReason } from '@/registry/lib/dynamic-dialog-state';

interface DynamicDialogContextValue {
  actions: DialogActions<unknown>;
  componentProps: Record<string, unknown>;
}

const DynamicDialogContext = createContext<DynamicDialogContextValue | null>(null);

export function useDynamicDialog(): DialogActions<unknown>;
export function useDynamicDialog<TProps extends object, TValue = unknown>(): DialogActions<TValue> & { props: TProps };
export function useDynamicDialog() {
  const ctx = useContext(DynamicDialogContext);
  if (!ctx) throw new Error('useDynamicDialog must be used within a dialog rendered by DynamicDialogProvider');
  return { ...ctx.actions, props: ctx.componentProps };
}

interface DialogStateItem {
  id: string;
  open: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: React.ComponentType<any>;
  componentProps: Record<string, unknown>;
}

function DynamicDialogItem({ id, open, Component, componentProps }: DialogStateItem) {
  const confirm = (value?: unknown) => dialogObservable.confirmDialog(id, value);
  const dismiss = (reason?: DismissReason, value?: unknown) => dialogObservable.dismissDialog(id, reason, value);
  const onOpenChange = (isOpen: boolean) => { if (!isOpen) dismiss('close'); };

  const actions: DialogActions<unknown> = { confirm, dismiss, open, onOpenChange };

  return (
    <DynamicDialogContext.Provider value={{ actions, componentProps }}>
      <Component {...componentProps} {...actions} />
    </DynamicDialogContext.Provider>
  );
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

"use client"

import React, { useState, useEffect, useContext, createContext, useRef } from 'react';
import { dialogObservable } from '@/lib/dynamic-dialog/dynamic-dialog-state';
import type { DialogActions, DismissReason } from '@/lib/dynamic-dialog/dynamic-dialog-state';

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
  Component: React.ComponentType<Record<string, unknown>>;
  componentProps: Record<string, unknown>;
  beforeClose?: () => boolean | Promise<boolean>;
}

export interface DynamicDialogProviderProps {
  /** Milliseconds to wait after close animation before unmounting the dialog. Must match the CSS exit animation duration. */
  removeDelay?: number;
}

function DynamicDialogItem({ id, open, Component, componentProps, beforeClose }: DialogStateItem) {
  const confirm = (value?: unknown) => dialogObservable.confirmDialog(id, value);
  const dismiss = (reason?: DismissReason, value?: unknown) => dialogObservable.dismissDialog(id, reason, value);
  const onOpenChange = async (isOpen: boolean) => {
    if (!isOpen) {
      if (beforeClose) {
        const canClose = await beforeClose();
        if (!canClose) return;
      }
      dismiss('close');
    }
  };

  const actions: DialogActions<unknown> = { confirm, dismiss, open, onOpenChange };

  return (
    <DynamicDialogContext.Provider value={{ actions, componentProps }}>
      <Component {...componentProps} {...actions} />
    </DynamicDialogContext.Provider>
  );
}

export function DynamicDialogProvider({ removeDelay = 300 }: DynamicDialogProviderProps) {
  const [dialogs, setDialogs] = useState<DialogStateItem[]>([]);
  const removeDelayRef = useRef(removeDelay);
  removeDelayRef.current = removeDelay;

  useEffect(() => {
    const unsubscribe = dialogObservable.subscribe((event) => {
      switch (event.action) {
        case 'SHOW_DIALOG':
          setDialogs(prev => [...prev, {
            id: event.id,
            open: true,
            Component: event.Component,
            componentProps: event.componentProps,
            beforeClose: event.beforeClose,
          }]);
          break;
        case 'UPDATE_DIALOG':
          setDialogs(prev =>
            prev.map(d => d.id === event.id ? { ...d, componentProps: event.componentProps } : d)
          );
          break;
        case 'HIDE_DIALOG':
          setDialogs(prev =>
            prev.map(d => d.id === event.id ? { ...d, open: false } : d)
          );
          setTimeout(() => {
            setDialogs(prev => prev.filter(d => d.id !== event.id));
          }, removeDelayRef.current);
          break;
      }
    });

    return () => {
      unsubscribe();
      dialogObservable.dismissAllDialogs('close');
    };
  }, []);

  return (
    <>
      {dialogs.map(d => (
        <DynamicDialogItem key={d.id} {...d} />
      ))}
    </>
  );
}

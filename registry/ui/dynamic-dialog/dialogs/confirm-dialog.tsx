"use client"

import React, { type ReactNode } from "react";
import { dialog, type DialogActions, type DialogComponentProps } from "@/registry/lib/dynamic-dialog-state";
import { Button } from "@/registry/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/registry/ui/alert-dialog";
import { Trash2 } from "lucide-react";

type ResolveValue = boolean | undefined

export interface ConfirmDialogHeader {
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
}

type ConfirmDialogAction<T> = string | {label: string, onClick: (props: DialogActions<T>) => void} | ((props: DialogActions<T>)=> ReactNode) | ReactNode 

export interface ConfirmDialogActions<T> {
  showCancel?: boolean;
  showConfirm?: boolean;
  cancelButton?: ConfirmDialogAction<T>
  confirmButton?: ConfirmDialogAction<T>
  customButtons?: Array<ConfirmDialogAction<T>>
}

export interface ConfirmDialogProps {
  header?: ReactNode | ((props: DialogActions<ResolveValue>) => ReactNode) | ConfirmDialogHeader;
  actions?: ConfirmDialogActions<ResolveValue>
}

function isConfirmDialogHeader(value: unknown): value is ConfirmDialogHeader {
  return (
    value !== null &&
    typeof value === "object" &&
    !React.isValidElement(value) &&
    ("title" in value || "description" in value || "icon" in value)
  );
}

type ButtonDescriptor = { label: string; onClick: (props: DialogActions<ResolveValue>) => void };

function isButtonDescriptor(value: unknown): value is ButtonDescriptor {
  return (
    value !== null &&
    typeof value === "object" &&
    !React.isValidElement(value) &&
    "label" in value &&
    "onClick" in value
  );
}

function renderAction(
  action: ConfirmDialogAction<ResolveValue>,
  dialogProps: DialogActions<ResolveValue>,
  defaultOnClick: () => void,
  variant: React.ComponentProps<typeof Button>["variant"]
): ReactNode {
  if (typeof action === "function") return action(dialogProps);
  if (typeof action === "string") {
    return <Button variant={variant} onClick={defaultOnClick}>{action}</Button>;
  }
  if (isButtonDescriptor(action)) {
    return <Button variant={variant} onClick={() => action.onClick(dialogProps)}>{action.label}</Button>;
  }
  return action as ReactNode;
}

export const confirmDialog = dialog(function (props: DialogComponentProps<ConfirmDialogProps, ResolveValue>) {
  const renderHeader = () => {
    if (typeof props.header === "function") {
      return props.header(props);
    }
    if (isConfirmDialogHeader(props.header)) {
      return (
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
            {props.header.icon ?? <Trash2 className="w-5 h-5 text-destructive" />}
          </div>
          <div>
            <AlertDialogTitle className="text-lg font-semibold text-foreground">
              {props.header.title ?? "Are you sure?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              {props.header.description ?? ""}
            </AlertDialogDescription>
          </div>
        </div>
      );
    }
    return props.header;
  };

  const renderActions = () => {
    const { actions } = props;
    const showCancel = actions?.showCancel !== false;
    const showConfirm = actions?.showConfirm !== false;

    const cancelNode = showCancel
      ? actions?.cancelButton !== undefined
        ? renderAction(actions.cancelButton, props, () => props.dismiss("cancel"), "outline")
        : <Button type="button" variant="outline" onClick={() => props.dismiss("cancel")}>Cancel</Button>
      : null;

    const confirmNode = showConfirm
      ? actions?.confirmButton !== undefined
        ? renderAction(actions.confirmButton, props, () => props.confirm(true), "destructive")
        : <Button type="submit" variant="destructive" onClick={() => props.confirm(true)}>Confirm</Button>
      : null;

    const customNodes = actions?.customButtons?.map((btn, i) => (
      <React.Fragment key={i}>
        {renderAction(btn, props, () => {}, "outline")}
      </React.Fragment>
    ));

    return (
      <div className="flex justify-end space-x-3 pt-2">
        {customNodes}
        {cancelNode}
        {confirmNode}
      </div>
    );
  };

  return (
    <AlertDialog open={props.open} onOpenChange={props.onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          {renderHeader()}
        </AlertDialogHeader>
        {renderActions()}
      </AlertDialogContent>
    </AlertDialog>
  );
});

"use client"

import React, { type ReactNode } from "react";
import { dialog, type DialogActions, type DialogComponentProps } from "@/registry/lib/dynamic-dialog-state";
import {
  type DialogActionButton,
  type DialogActionsContainer,
  renderStandardDialogActions,
} from "@/lib/dynamic-dialog-actions";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/registry/ui/alert-dialog";
import { Trash2 } from "lucide-react";

type ResolveValue = boolean | undefined;

export interface ConfirmDialogHeader {
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
}

// Each dialog defines its own actions shape using DialogActionButton directly.
// confirmDialog exposes cancel + optional custom buttons + confirm.
// There is no shared DialogActionsConfig — the slot names and their presence
// are specific to this dialog's semantics.
export interface ConfirmDialogActionsConfig {
  cancelButton?: DialogActionButton<ResolveValue>;
  customButtons?: DialogActionButton<ResolveValue>[];
  confirmButton?: DialogActionButton<ResolveValue>;
  container?: DialogActionsContainer<ResolveValue>;
}

export interface ConfirmDialogProps {
  header?: ReactNode | ((props: DialogActions<ResolveValue>) => ReactNode) | ConfirmDialogHeader;
  actions?: ConfirmDialogActionsConfig;
}

function isConfirmDialogHeader(value: unknown): value is ConfirmDialogHeader {
  return (
    value !== null &&
    typeof value === "object" &&
    !React.isValidElement(value) &&
    ("title" in value || "description" in value || "icon" in value)
  );
}

export const confirmDialog = dialog(function (
  props: DialogComponentProps<ConfirmDialogProps, ResolveValue>,
) {
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

  return (
    <AlertDialog open={props.open} onOpenChange={props.onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          {renderHeader()}
        </AlertDialogHeader>
        {renderStandardDialogActions(
          props.actions ?? {},
          props,
          undefined,
          {
            cancel: {
              label: "Cancel",
              variant: "outline",
              type: "button",
              onClick: (a) => a.dismiss("cancel"),
            },
            confirm: {
              label: "Confirm",
              variant: "destructive",
              type: "submit",
              onClick: (a) => a.confirm(true),
            },
          },
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
});

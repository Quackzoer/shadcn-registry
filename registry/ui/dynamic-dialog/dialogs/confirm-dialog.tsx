"use client"

import { dialog } from "@/registry/lib/dynamic-dialog-state";
import { type DialogRendererProps } from "@/registry/lib/dynamic-dialog-state";
import { Button } from "@/registry/ui/button";
import { AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/registry/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { type ReactNode } from "react";

export interface ConfirmDialogProps{
  title: ReactNode;
  description: ReactNode;
}

export function ConfirmDialog(props: ConfirmDialogProps & DialogRendererProps<boolean>) {
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <AlertDialogTitle className="text-lg font-semibold text-foreground">
              {props.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              {props.description}
            </AlertDialogDescription>
          </div>
        </div>
      </AlertDialogHeader>

      <div className="flex justify-end space-x-3 pt-2">
        <Button
          type="button"
          onClick={() => props.dismiss("cancel")}
          variant={"outline"}
        >
          Cancel
        </Button>
        <Button
          variant={"destructive"}
          type="submit"
          onClick={() => props.confirm()}
        >
          Confirm
        </Button>
      </div>
    </AlertDialogContent>
  );
}

export const confirmDialog = dialog(ConfirmDialog);

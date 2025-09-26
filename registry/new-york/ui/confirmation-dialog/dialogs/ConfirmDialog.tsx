"use client"

import { DialogRendererProps } from "@/registry/new-york/lib/confirmation-dialog/types";
import { Button } from "@/registry/new-york/ui/button";
import { DialogDescription, DialogHeader, DialogTitle } from "@/registry/new-york/ui/dialog";
import { Trash2 } from "lucide-react";
import { ReactNode } from "react";

export interface ConfirmDialogProps{
  title: ReactNode;
  description: ReactNode;
}

export function ConfirmDialog(props: ConfirmDialogProps & DialogRendererProps<boolean>) {
  return (
    <div>
      <DialogHeader>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <DialogTitle className="text-lg font-semibold text-foreground">
              {props.title}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {props.description}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="flex justify-end space-x-3 pt-2">
        <Button
          type="button"
          onClick={() => props.cancel()}
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
    </div>
  );
}
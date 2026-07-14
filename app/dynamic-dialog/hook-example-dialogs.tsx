"use client"

import { dialog } from "@/registry/lib/dynamic-dialog-state";
import { useDynamicDialog } from "@/registry/ui/dynamic-dialog/dynamic-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/registry/ui/dialog";
import { Button } from "@/registry/ui/button";
import { useEffect, useState } from "react";

// --- Dialog 1 ---
// Reads closeAfterMs and label from hook, closes itself via hook dismiss.

interface AutoCloseProps {
  label: string;
  closeAfterMs: number;
}

function AutoCloseDialog() {
  const { open, onOpenChange, dismiss, props } = useDynamicDialog<AutoCloseProps>();
  const [remaining, setRemaining] = useState(Math.ceil(props.closeAfterMs / 1000));

  useEffect(() => {
    const timer = setTimeout(() => dismiss("time-out"), props.closeAfterMs);
    return () => clearTimeout(timer);
    // props.closeAfterMs and dismiss are stable for the lifetime of this dialog instance
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setRemaining(prev => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{props.label}</DialogTitle>
          <DialogDescription>
            Closes automatically · label and timer read from hook props
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-6">
          <span className="text-5xl font-bold tabular-nums text-muted-foreground">
            {remaining}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const autoCloseDialog = dialog(AutoCloseDialog);

// --- Dialog 2 ---
// Reads message from hook props and displays it. Confirms with the message as the resolved value.

interface MessageProps {
  message: string;
}

function MessageDialog() {
  const { open, onOpenChange, confirm, dismiss, props } = useDynamicDialog<MessageProps, string>();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Message Dialog</DialogTitle>
          <DialogDescription>
            Stays open · message read from hook props
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-md bg-muted px-4 py-3 my-4 font-mono text-sm">
          {props.message}
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => dismiss("cancel")}>
            Cancel
          </Button>
          <Button onClick={() => confirm(props.message)}>
            Confirm with value
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const messageDialog = dialog(MessageDialog);

// --- Opens both at once ---
// AutoClose dialog closes itself after 5s. MessageDialog waits for user input.
// With both open simultaneously this shows each dialog reads its own context.

export async function openHookExampleDialogs() {
  autoCloseDialog({
    props: { label: "I close on my own", closeAfterMs: 5000 },
  });

  const result = await messageDialog({
    props: { message: "Hello from isolated context!" },
  });

  return result;
}

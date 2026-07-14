"use client"

import { dialog, type DialogComponentProps } from '@/registry/lib/dynamic-dialog-state';
import { Button } from "@/registry/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/registry/ui/dialog";
import { AlertTriangle, Check, Clock } from "lucide-react";
import { useEffect, useState } from 'react';

export interface DelayedActionDialogProps {
  delaySeconds: number;
  warningMessage?: string;
  allowCancel?: boolean;
  dangerAction?: boolean;
}

const circumference = 2 * Math.PI * 20;

export function DelayedActionDialog(props: DialogComponentProps<DelayedActionDialogProps, boolean>) {
  const [timeRemaining, setTimeRemaining] = useState(props.delaySeconds);
  const [canInteract, setCanInteract] = useState(false);

  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    const enableTimer = setTimeout(() => {
      setCanInteract(true);
    }, props.delaySeconds * 1000);

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(enableTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConfirm = () => {
    if (canInteract) props.confirm(true);
  };

  const handleCancel = () => {
    if (props.allowCancel !== false) props.dismiss("cancel");
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <style>{`
          @keyframes __dal-bar { from { width: 0% } to { width: 100% } }
          @keyframes __dal-circle { from { stroke-dashoffset: ${circumference} } to { stroke-dashoffset: 0 } }
        `}</style>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              props.dangerAction ? 'bg-destructive/10' : 'bg-orange-500/10'
            }`}>
              {props.dangerAction ? (
                <AlertTriangle className="w-5 h-5 text-destructive" />
              ) : (
                <Clock className="w-5 h-5 text-orange-500" />
              )}
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-foreground">
                Please Wait
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {canInteract
                  ? 'You can now proceed'
                  : `Please wait ${timeRemaining} seconds before continuing`
                }
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          {props.warningMessage && (
            <div className={`p-3 rounded-md border-l-4 ${
              props.dangerAction
                ? 'bg-destructive/5 border-destructive text-destructive-foreground'
                : 'bg-orange-50 border-orange-500 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
            }`}>
              <p className="text-sm font-medium">{props.warningMessage}</p>
            </div>
          )}

          {!canInteract && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Time remaining</span>
                  <span>{timeRemaining}s</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      props.dangerAction ? 'bg-destructive' : 'bg-orange-500'
                    }`}
                    style={{ animation: `__dal-bar ${props.delaySeconds}s linear forwards` }}
                  />
                </div>
              </div>

              <div className="flex justify-center py-2">
                <div className="relative w-12 h-12">
                  <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="none" className="text-muted" />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={circumference}
                      className={props.dangerAction ? 'text-destructive' : 'text-orange-500'}
                      style={{ animation: `__dal-circle ${props.delaySeconds}s linear forwards` }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-foreground">{timeRemaining}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {canInteract && (
            <div className="flex justify-center py-4">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Check className="w-6 h-6" />
                <span className="font-medium">Ready to proceed</span>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            {props.allowCancel !== false && (
              <Button type="button" onClick={handleCancel} variant="outline">
                Cancel
              </Button>
            )}
            <Button
              onClick={handleConfirm}
              disabled={!canInteract}
              variant={props.dangerAction ? "destructive" : "default"}
            >
              {!canInteract
                ? `Please wait (${timeRemaining}s)`
                : props.dangerAction
                ? 'Confirm Action'
                : 'Continue'
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const delayedActionDialog = dialog(DelayedActionDialog);

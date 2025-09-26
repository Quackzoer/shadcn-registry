"use client"

import { DialogRendererProps } from '@/registry/new-york/lib/confirmation-dialog/types';
import { Button } from "@/registry/new-york/ui/button";
import { DialogDescription, DialogHeader, DialogTitle } from "@/registry/new-york/ui/dialog";
import { AlertTriangle, Check, Clock } from "lucide-react";
import { useEffect, useState } from 'react';

interface DelayedActionDialogProps {
  delaySeconds: number;
  warningMessage?: string;
  allowCancel?: boolean;
  dangerAction?: boolean;
}

export function DelayedActionDialog(props: DelayedActionDialogProps & DialogRendererProps<boolean>) {
  const [timeRemaining, setTimeRemaining] = useState(props.delaySeconds);
  const [canInteract, setCanInteract] = useState(false);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanInteract(true);
    }
  }, [timeRemaining]);

  const progressPercentage = ((props.delaySeconds - timeRemaining) / props.delaySeconds) * 100;

  const handleConfirm = () => {
    if (canInteract) {
      props.confirm(true);
    }
  };

  const handleCancel = () => {
    if (props.allowCancel !== false) {
      props.cancel();
    }
  };

  return (
    <div>
      <DialogHeader>
        <div className="flex items-center gap-3 mb-4">
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            props.dangerAction
              ? 'bg-destructive/10'
              : 'bg-orange-500/10'
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

        {/* Warning Message */}
        {props.warningMessage && (
          <div className={`p-3 rounded-md border-l-4 ${
            props.dangerAction
              ? 'bg-destructive/5 border-destructive text-destructive-foreground'
              : 'bg-orange-50 border-orange-500 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
          }`}>
            <p className="text-sm font-medium">{props.warningMessage}</p>
          </div>
        )}


        {/* Progress Indicators */}
        {!canInteract && (
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Time remaining</span>
                <span>{timeRemaining}s</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-1000 ease-linear ${
                    props.dangerAction ? 'bg-destructive' : 'bg-orange-500'
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Countdown Circle */}
            <div className="flex justify-center py-2">
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 48 48">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - progressPercentage / 100)}`}
                    className={`transition-all duration-1000 ease-linear ${
                      props.dangerAction ? 'text-destructive' : 'text-orange-500'
                    }`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-foreground">{timeRemaining}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {canInteract && (
          <div className="flex justify-center py-4">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <Check className="w-6 h-6" />
              <span className="font-medium">Ready to proceed</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-2">
          {(props.allowCancel !== false) && (
            <Button
              type="button"
              onClick={handleCancel}
              variant="outline"
            >
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
    </div>
  );
}
"use client"

import { dialog, type DialogComponentProps } from '@/registry/lib/dynamic-dialog-state';
import { Button } from "@/registry/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/registry/ui/dialog";
import { Clock } from "lucide-react";
import { useEffect, useState } from 'react';

export interface CountdownDialogProps {
  countdownSeconds: number;
  autoConfirm?: boolean;
  showProgress?: boolean;
}

const circumference = 2 * Math.PI * 28;

export function CountdownDialog(props: DialogComponentProps<CountdownDialogProps, string>) {
  const [timeRemaining, setTimeRemaining] = useState(props.countdownSeconds);

  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    const doneTimer = setTimeout(() => {
      if (props.autoConfirm) props.confirm('auto-confirmed');
    }, props.countdownSeconds * 1000);

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(doneTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = () => props.dismiss("cancel");
  const handleConfirm = () => props.confirm('confirm pressed');

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <style>{`
          @keyframes __cd-bar { from { width: 0% } to { width: 100% } }
          @keyframes __cd-circle { from { stroke-dashoffset: ${circumference} } to { stroke-dashoffset: 0 } }
        `}</style>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-foreground">
                Timed Action
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {props.autoConfirm
                  ? `Auto-confirming in ${timeRemaining}s`
                  : `Action available in ${timeRemaining}s`
                }
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          {props.showProgress !== false && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Time remaining</span>
                <span>{timeRemaining}s</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ animation: `__cd-bar ${props.countdownSeconds}s linear forwards` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-center py-4">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={circumference}
                  className="text-primary"
                  style={{ animation: `__cd-circle ${props.countdownSeconds}s linear forwards` }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-foreground">{timeRemaining}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button
              type="button"
              onClick={handleCancel}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={timeRemaining > 0 && !props.autoConfirm}
              variant="default"
            >
              {timeRemaining > 0 && !props.autoConfirm
                ? `Confirm (${timeRemaining}s)`
                : 'Confirm'
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const countdownDialog = dialog(CountdownDialog);

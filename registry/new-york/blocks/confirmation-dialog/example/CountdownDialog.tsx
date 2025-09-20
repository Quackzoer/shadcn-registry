"use client"

import { useState, useEffect } from 'react';
import { Button } from "@/registry/new-york/ui/button";
import { DialogDescription, DialogHeader, DialogTitle } from "@/registry/new-york/ui/dialog";
import { Clock } from "lucide-react";
import type { DialogProps, DismissReason } from '../types';

export function CountdownDialog(props: DialogProps<string, string, DismissReason.TIMER | DismissReason.CANCEL | DismissReason.ESC> & {
  countdownSeconds: number;
  autoConfirm?: boolean;
  showProgress?: boolean;
}) {
  const [timeRemaining, setTimeRemaining] = useState(props.countdownSeconds);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (timeRemaining > 0 && isActive) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && props.autoConfirm) {
      props.confirm('auto-confirmed');
    }
  }, [timeRemaining, isActive, props]);

  const progressPercentage = ((props.countdownSeconds - timeRemaining) / props.countdownSeconds) * 100;

  const handleCancel = () => {
    setIsActive(false);
    props.cancel();
  };

  const handleConfirm = () => {
    setIsActive(false);
    props.confirm('confirm pressed');
  };

  return (
    <div>
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


        {/* Progress Bar */}
        {props.showProgress !== false && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Time remaining</span>
              <span>{timeRemaining}s</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Countdown Circle */}
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
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - progressPercentage / 100)}`}
                className="text-primary transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-foreground">{timeRemaining}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
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
    </div>
  );
}
"use client"

import { useState, useEffect } from 'react';
import type { DialogProps } from '@/registry/new-york/blocks/confirmation-dialog/types';

export function CountdownDialog(props: DialogProps & {
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
      props.confirm(true);
    }
  }, [timeRemaining, isActive, props]);

  const progressPercentage = ((props.countdownSeconds - timeRemaining) / props.countdownSeconds) * 100;

  const handleCancel = () => {
    setIsActive(false);
    props.cancel();
  };

  const handleConfirm = () => {
    setIsActive(false);
    props.confirm(true);
  };

  return (
    <div className="bg-card rounded-lg shadow-xl max-w-md w-full mx-4 p-6 border">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{ 'Timed Action'}</h3>
            <p className="text-sm text-muted-foreground">
              {props.autoConfirm
                ? `Auto-confirming in ${timeRemaining}s`
                : `Action available in ${timeRemaining}s`
              }
            </p>
          </div>
        </div>


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
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={timeRemaining > 0 && !props.autoConfirm}
            className={`px-4 py-2 rounded-md transition-colors ${
              timeRemaining > 0 && !props.autoConfirm
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {timeRemaining > 0 && !props.autoConfirm
              ? `Confirm (${timeRemaining}s)`
              : 'Confirm'
            }
          </button>
        </div>
      </div>
    </div>
  );
}
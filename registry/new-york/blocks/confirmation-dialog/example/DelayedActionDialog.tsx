import { useState, useEffect } from 'react';
import type { DialogRenderProps } from '../types';

interface DelayedActionDialogProps extends DialogRenderProps {
  delaySeconds: number;
  warningMessage?: string;
  allowCancel?: boolean;
  dangerAction?: boolean;
}

export function DelayedActionDialog(props: DelayedActionDialogProps) {
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
    <div className="bg-card rounded-lg shadow-xl max-w-md w-full mx-4 p-6 border">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            props.dangerAction
              ? 'bg-destructive/10'
              : 'bg-orange-500/10'
          }`}>
            {props.dangerAction ? (
              <svg className="w-5 h-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{props.title || 'Please Wait'}</h3>
            <p className="text-sm text-muted-foreground">
              {canInteract
                ? 'You can now proceed'
                : `Please wait ${timeRemaining} seconds before continuing`
              }
            </p>
          </div>
        </div>

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

        {/* Main Message */}
        {props.message && (
          <p className="text-foreground">{props.message}</p>
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
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">Ready to proceed</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          {(props.allowCancel !== false) && (
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleConfirm}
            disabled={!canInteract}
            className={`px-4 py-2 rounded-md transition-colors ${
              !canInteract
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : props.dangerAction
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {!canInteract
              ? `Please wait (${timeRemaining}s)`
              : props.dangerAction
              ? 'Confirm Action'
              : 'Continue'
            }
          </button>
        </div>
      </div>
    </div>
  );
}
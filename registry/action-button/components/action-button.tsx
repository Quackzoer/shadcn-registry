'use client'

import { type ComponentProps, type MouseEvent, type ReactNode, useTransition } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { LoadingSwap } from '@/registry/loading-swap/components/loading-swap'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { confirmDialog } from '@/registry/dynamic-dialog/components/dialogs/confirm-dialog'

/**
 * What an action reports back.
 *
 * `void` is allowed so a simple action doesn't have to invent a return value —
 * an action that throws or returns nothing is treated as success.
 */
export interface ActionResult {
  error: boolean
  message?: string
}

export interface ActionButtonProps
  extends Omit<ComponentProps<typeof Button>, 'onClick'> {
  /** The work to run. Its promise drives the loading state. */
  action: () => Promise<ActionResult | void>

  /** Ask for confirmation before running the action. */
  requireAreYouSure?: boolean
  areYouSureTitle?: ReactNode
  areYouSureDescription?: ReactNode
  areYouSureConfirmText?: string
  areYouSureCancelText?: string

  /** Tooltip content. Omit for no tooltip. */
  tooltip?: ReactNode
  tooltipSide?: ComponentProps<typeof TooltipContent>['side']

  /**
   * Runs before the confirmation dialog. Call `preventDefault()` to stop the
   * action entirely — useful for client-side validation.
   */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
}

/**
 * A `Button` that runs an async action, showing a spinner while it's in flight
 * and optionally asking for confirmation first.
 *
 * Wraps the stock `Button` rather than replacing it — every Button prop
 * (`variant`, `size`, `className`, `asChild`, …) passes straight through, so
 * this can be swapped in anywhere a Button is used without restyling.
 *
 * Adapted from WebDevSimplified's ActionButton
 * (https://wds-shadcn-registry.netlify.app/components/action-button/), with the
 * confirmation step moved onto the promise-based `confirmDialog` and a tooltip
 * added. See the README for what that changes.
 */
export function ActionButton({
  action,
  requireAreYouSure = false,
  areYouSureTitle = 'Are you sure?',
  areYouSureDescription = 'This action cannot be undone.',
  areYouSureConfirmText = 'Yes',
  areYouSureCancelText = 'Cancel',
  tooltip,
  tooltipSide,
  onClick,
  children,
  disabled,
  ...props
}: ActionButtonProps) {
  const [isLoading, startTransition] = useTransition()

  const runAction = () => {
    startTransition(async () => {
      const result = await action()
      // A void return means "nothing to report" — only an explicit error toasts.
      if (result?.error) toast.error(result.message ?? 'Error')
    })
  }

  const handleClick = async (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (event.defaultPrevented) return

    if (requireAreYouSure) {
      // Awaiting the dialog keeps this a single linear path. The original had
      // to branch into two different JSX trees — one wrapped in an
      // AlertDialogTrigger, one not — because the dialog had to exist in the
      // render output to be openable.
      const { confirmed } = await confirmDialog({
        props: {
          header: {
            title: areYouSureTitle,
            description: areYouSureDescription,
          },
          actions: {
            confirmButton: areYouSureConfirmText,
            cancelButton: areYouSureCancelText,
          },
        },
      })
      if (!confirmed) return
    }

    runAction()
  }

  const isDisabled = disabled ?? isLoading

  const button = (
    <Button {...props} disabled={isDisabled} onClick={handleClick}>
      <LoadingSwap
        isLoading={isLoading}
        className="inline-flex items-center gap-2"
      >
        {children}
      </LoadingSwap>
    </Button>
  )

  if (!tooltip) return button

  return (
    <Tooltip>
      {/*
        A disabled button emits no pointer events, so a tooltip attached
        directly to it goes silent exactly when it is most needed — explaining
        *why* the button is disabled. The span gives the trigger something that
        still receives hover and focus.
      */}
      <TooltipTrigger asChild>
        {isDisabled ? (
          <span className="inline-flex" tabIndex={0}>
            {button}
          </span>
        ) : (
          button
        )}
      </TooltipTrigger>
      <TooltipContent side={tooltipSide}>{tooltip}</TooltipContent>
    </Tooltip>
  )
}

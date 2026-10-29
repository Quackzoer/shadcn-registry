'use client'

import { Toaster, toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ActionButton } from '@/registry/action-button/components/action-button'
import { DynamicDialogProvider } from '@/registry/dynamic-dialog/components/dynamic-dialog'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export default function Page() {
  return (
    <div className="mx-auto flex min-h-svh max-w-3xl flex-col gap-8 px-4 py-8">
      {/* The confirm step renders through this provider; mount it once, high up. */}
      <DynamicDialogProvider />
      <Toaster richColors />

      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Action Button</h1>
        <p className="text-muted-foreground">
          A Button that runs an async action, shows a spinner while it&apos;s in
          flight, and can ask for confirmation first.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Plain async action</CardTitle>
          <CardDescription>
            The promise drives the loading state. The label stays in place —
            <code> LoadingSwap</code> overlays the spinner rather than replacing
            the content, so the button never changes width.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <ActionButton
            action={async () => {
              await delay(1500)
            }}
          >
            Save settings
          </ActionButton>
          <Badge variant="outline">returns void</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reporting an error</CardTitle>
          <CardDescription>
            Returning <code>{'{ error: true }'}</code> toasts the message. A
            <code> void</code> return means nothing to report.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ActionButton
            variant="outline"
            action={async () => {
              await delay(1200)
              return { error: true, message: 'Could not reach the server.' }
            }}
          >
            Trigger a failure
          </ActionButton>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Confirmation</CardTitle>
          <CardDescription>
            <code>requireAreYouSure</code> awaits <code>confirmDialog</code>{' '}
            before running. Cancelling never starts the action.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <ActionButton
            variant="destructive"
            requireAreYouSure
            areYouSureDescription="This will permanently delete the project and everything in it."
            areYouSureConfirmText="Delete it"
            action={async () => {
              await delay(1500)
            }}
          >
            Delete project
          </ActionButton>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tooltip</CardTitle>
          <CardDescription>
            Works while disabled too — that is usually when a tooltip matters
            most, since it is the only way to explain why the button can&apos;t
            be pressed.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <ActionButton
            tooltip="Publishes to production immediately"
            action={async () => {
              await delay(1500)
            }}
          >
            Publish
          </ActionButton>

          <ActionButton
            disabled
            tooltip="You need the deploy permission for this"
            tooltipSide="right"
            action={async () => {}}
          >
            Deploy
          </ActionButton>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cancelling from onClick</CardTitle>
          <CardDescription>
            <code>onClick</code> runs first; calling{' '}
            <code>preventDefault()</code> stops the action before the
            confirmation appears. Useful for client-side validation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ActionButton
            variant="secondary"
            onClick={(e) => {
              e.preventDefault()
              toast.info('Blocked by onClick — the action never ran.')
            }}
            requireAreYouSure
            action={async () => {
              await delay(1000)
            }}
          >
            Always blocked
          </ActionButton>
        </CardContent>
      </Card>
    </div>
  )
}

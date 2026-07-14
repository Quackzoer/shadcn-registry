"use client"

import { Button } from "@/registry/ui/button"
import { countdownDialog } from "@/components/dynamic-dialog/dialogs/countdown-dialog"
import { typeToConfirmDialog } from "@/components/dynamic-dialog/dialogs/type-to-confirm-dialog"
import { DynamicDialogProvider } from "@/components/dynamic-dialog/dynamic-dialog"
import { testDialog } from "./test-dialog"
import { openHookExampleDialogs } from "./hook-example-dialogs"
import { loadingDialog } from "@/components/dynamic-dialog/dialogs/loading-dialog"

export default function Page() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col min-h-svh px-4 py-8 gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Custom Registry</h1>
        <p className="text-muted-foreground">
          A custom registry for distributing code using shadcn.
        </p>
      </header>
      <main className="flex flex-col flex-1 gap-8">
        <Button
          onClick={() => {
            const promise = new Promise<string>((resolve) =>
              setTimeout(() => resolve('done'), 3000)
            )
            loadingDialog({
              props: {
                title: 'Loading...',
                description: 'Resolves after 3 seconds.',
                promise,
              }
            }).then(({ reason, value }) => {
              // reason === 'success' → resolved, value is the resolved value
              // reason === 'error'   → rejected, value is the error
              // reason === 'close'   → user dismissed (only when allowCancel: true)
              console.log('Loading dialog settled:', reason, value)
            })
          }}
        >
          Loading dialog (auto-dismiss on promise)
        </Button>
        <Button
          onClick={() => {
            const promise = new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Something went wrong')), 2000)
            )
            loadingDialog({
              props: {
                title: 'Deleting...',
                promise,
              }
            }).then(({ reason, value }) => {
              console.log('Loading dialog settled:', reason, value)
            })
          }}
        >
          Loading dialog (rejects after 2s)
        </Button>
        <Button
          onClick={() => {
            const promise = new Promise<string>((resolve) =>
              setTimeout(() => resolve('uploaded'), 5000)
            )
            loadingDialog({
              props: {
                title: 'Uploading...',
                description: 'You can cancel this operation.',
                allowCancel: true,
                promise,
              }
            }).then(({ reason }) => {
              console.log('Loading dialog reason:', reason)
            })
          }}
        >
          Loading dialog (cancellable)
        </Button>
        <Button
          onClick={() => {
            countdownDialog({ props: { countdownSeconds: 5 } }).then((result) => {
              console.log(result)
            })
          }}
        >
          Delayed action dialog
        </Button>
        <Button
          onClick={() => {
            typeToConfirmDialog({ props: { itemName: 'some-file.txt' } }).then((result) => {
              console.log(result)
            })
          }}
        >
          Type to confirm dialog
        </Button>
        <Button
          onClick={() => {
            const typeToConfirmDialogRes = typeToConfirmDialog({ props: { itemName: 'some-file.txt' } })
            const countdownDialogRes = countdownDialog({ props: { countdownSeconds: 10 } })
            typeToConfirmDialogRes.then(({ value }) => {
              console.log('Type to confirm result:', value)
            })
            countdownDialogRes.then(({ value }) => {
              console.log('Countdown dialog result:', value)
            })
          }}
        >
          Two dialogs at once
        </Button>
        <Button
          onClick={() => {
            const countdownDialogRes = countdownDialog({ props: { countdownSeconds: 20 } })
            setTimeout(() => {
              countdownDialogRes.dismiss("time-out", 'Dismissed after 5 seconds')
            }, 5000)
          }}
        >
          Dialog dismissed after 5 seconds
        </Button>
        <Button
          onClick={() => {
            testDialog().then((result) => {
              console.log(result)
            })
          }}
        >
          Test Dialog
        </Button>
        <Button
          onClick={() => {
            openHookExampleDialogs().then((result) => {
              console.log("Hook example result:", result)
            })
          }}
        >
          Hook example (two dialogs, isolated contexts)
        </Button>
        <Button
          onClick={() => {
            const dialog = typeToConfirmDialog({
              props: {
                itemName: 'This will change after 5 seconds'
              }
            })
            setTimeout(() => {
              dialog.update({
                itemName: 'I changed!'
              })
            }, 5000)
          }}
        >
          Update dialog example
        </Button>
      </main>
      <DynamicDialogProvider />
    </div>
  )
}

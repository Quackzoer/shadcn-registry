"use client"

import { Button } from "@/registry/ui/button"
import { countDownDialog } from "@/registry/ui/dynamic-dialog/dialogs/countdown-dialog"
import { typeToConfirmDialog } from "@/registry/ui/dynamic-dialog/dialogs/type-to-confirm-dialog"
import { DynamicDialogProvider } from "@/registry/ui/dynamic-dialog/dynamic-dialog"

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
            countDownDialog({
              countdownSeconds: 5,
            }).async().then((result) => {
              console.log(result)
            })
          }}
        >
          Delayed action dialog
        </Button>
        <Button
          onClick={() => {
            typeToConfirmDialog({
              itemName: 'some-file.txt'
            }).async().then((result) => {
              console.log(result)
            })
          }}
        >
          Type to confirm dialog
        </Button>
        <Button
          onClick={() => {
            const typeToConfirmDialogRes = typeToConfirmDialog({
              itemName: 'some-file.txt',
            })
            const countDownDialogRes = countDownDialog({
              countdownSeconds: 10,
            })
            typeToConfirmDialogRes.value.then((result) => {
              console.log('Type to confirm result:', result)
            })
            countDownDialogRes.value.then((result) => {
              console.log('Countdown dialog result:', result)
            })
          }}
        >
          Two dialogs at once
        </Button>
        <Button
          onClick={() => {
            const countDownDialogRes = countDownDialog({
              countdownSeconds: 20,
            })
            setTimeout(() => {
              countDownDialogRes.dismiss("timer", 'Dismissed after 5 seconds')
            }, 5000)
          }}
        >
          Dialog dismissed after 5 seconds
        </Button>
      </main>
      <DynamicDialogProvider />
    </div>
  )
}

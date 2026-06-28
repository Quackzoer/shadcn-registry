"use client"

import { Button } from "@/registry/ui/button"
import { countdownDialog } from "@/registry/ui/dynamic-dialog/dialogs/countdown-dialog"
import { typeToConfirmDialog } from "@/registry/ui/dynamic-dialog/dialogs/type-to-confirm-dialog"
import { DynamicDialogProvider } from "@/registry/ui/dynamic-dialog/dynamic-dialog"
import { testDialog } from "./test-dialog"
import { openHookExampleDialogs } from "./hook-example-dialogs"
import { loadingDialog } from "@/registry/ui/dynamic-dialog/dialogs/loading-dialog"

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
            const dialog = loadingDialog({
              props: {
                description: 'I will finish loading in 5 seconds'
              }
            })
            dialog.then((result) => {
              console.log(result)
            })
            setTimeout(()=>{
              dialog.dismiss('time-out')
            },5000)
          }}
        >
          Loading dialog
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

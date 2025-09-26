"use client"

import * as React from "react"
import { DialogProvider } from "@/registry/new-york/ui/confirmation-dialog/dialog-provider"
import { Button } from "@/registry/new-york/ui/button"
import { dialog } from "@/registry/new-york/lib/confirmation-dialog/dialog"
import { DismissReason } from "@/registry/new-york/lib/confirmation-dialog/types"

export default function Home() {
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
            dialog.countdown({
              countdownSeconds: 5,
            }).then((result) => {
              console.log(result)
            })
          }}
        >
          Delayed action dialog
        </Button>
        <Button
          onClick={() => {
            dialog.typeToConfirm({
              itemName: 'some-file.txt'
            }).then((result) => {
              console.log(result)
            })
          }}
        >
          Type to confirm dialog
        </Button>
        <Button
          onClick={() => {
            dialog.typeToConfirm({
              itemName: 'some-file.txt'
            }).then((result) => {
              console.log(result)
            })
            dialog.countdown({
              countdownSeconds: 10,
            })
          }}
        >
          Two dialogs at once
        </Button>
        <Button
          onClick={() => {
            dialog.countdown({
              countdownSeconds: 20,
              id: 'dismiss-after-5-seconds'
            }).then((result) => {
              console.log(result)
            })
            setTimeout(() => {
              dialog.dismiss('dismiss-after-5-seconds', DismissReason.TIMER, 'Dismissed after 5 seconds')
            }, 5000)
          }}
        >
          Dialog dismissed after 5 seconds
        </Button>
      </main>
      <DialogProvider />
    </div>
  )
}

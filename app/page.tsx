"use client"

import * as React from "react"
import { DialogProvider } from "@/registry/new-york/blocks/confirmation-dialog/DialogProvider"
import { Button } from "@/registry/new-york/ui/button"
import { dialog } from "@/registry/new-york/blocks/confirmation-dialog/dialog"
import { Dialog, DialogContent, DialogTrigger } from "@/registry/new-york/ui/dialog"

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
        <Dialog>
          <DialogTrigger>
            <Button>
              Open dialog with custom content
            </Button>
          </DialogTrigger>
          <DialogContent>
            <div>
              <Button
                onClick={() => {
                  dialog.countdown({
                    countdownSeconds: 5,
                    autoConfirm: true,
                  }).then((result) => {
                    console.log(result)
                  })
                }}
              >
                Open dynamic dialog
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
      <DialogProvider />
    </div>
  )
}

"use client"

import { dialog } from "@/registry/new-york/lib/dynamic-dialog/dialog"
import { createUseQuery } from "@/registry/new-york/lib/react-query/use-query"
import { Button } from "@/registry/new-york/ui/button"
import { DynamicDialogProvider } from "@/registry/new-york/ui/dynamic-dialog/dynamic-dialog"

interface ExampleQueryFnProps {
  page: number;
}

const exampleQueryFn = async (props: ExampleQueryFnProps) => {
  if(!props.page) return { a: '', b: '', c: [] };
  return {
    a: `A${props.page}`,
    b: `B${props.page}`,
    c: [`C${props.page}1`, `C${props.page}2`, `C${props.page}3`],
  };
};

export const useQueryCallBackExample = createUseQuery(exampleQueryFn, ({ page }) => ({
  queryKey: ["example", page],
  enabled: page > 0,
}));

export const useQueryObjectExample = createUseQuery(exampleQueryFn, {
  queryKey: ["example", "object"],
})

export function useQueryExampleCLengthSelector(props: ExampleQueryFnProps) {
  return useQueryCallBackExample(props, {
    select: (data) => data.c.length,
    queryKey: ["length"]
  });
}



export default function PageClient() {
  const { data: dataA } = useQueryCallBackExample({page: 1});
  const { data: dataB } = useQueryObjectExample();
  const { data: dataC } = useQueryExampleCLengthSelector({ page: 2 });
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
            }).async().then((result) => {
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
            }).async().then((result) => {
              console.log(result)
            })
          }}
        >
          Type to confirm dialog
        </Button>
        <Button
          onClick={() => {
            const typeToConfirmDialog = dialog.typeToConfirm({
              itemName: 'some-file.txt',
            })
            const countDownDialog = dialog.countdown({
              countdownSeconds: 10,
            })
            typeToConfirmDialog.value.then((result) => {
              console.log('Type to confirm result:', result)
            })
            countDownDialog.value.then((result) => {
              console.log('Countdown dialog result:', result)
            })
          }}
        >
          Two dialogs at once
        </Button>
        <Button
          onClick={() => {
            const countDownDialog = dialog.countdown({
              countdownSeconds: 20,
            })
            setTimeout(() => {
              countDownDialog.dismiss("timer", 'Dismissed after 5 seconds')
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

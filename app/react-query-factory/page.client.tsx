"use client"

import { dialog } from "@/registry/lib/dynamic-dialog/dialog"
import { createUseQuery } from "@/registry/lib/react-query/use-query"
import { Button } from "@/registry/ui/button"
import { DynamicDialogProvider } from "@/registry/ui/dynamic-dialog/dynamic-dialog"

interface ExampleQueryFnWithParamsProps {
    page?: number;
}

const exampleQueryFnWithParams = async (props: ExampleQueryFnWithParamsProps) => {
    if (!props.page) return { a: '', b: '', c: [] };
    return {
        a: `A${props.page}`,
        b: `B${props.page}`,
        c: [`C${props.page}1`, `C${props.page}2`, `C${props.page}3`],
    };
};
const exampleQueryFnWithoutParams = async () => {
    return {
        a: `A`,
        b: `B`,
        c: [`C1`, `C2`, `C3`],
    };
};

const useQueryWithParamsCallBackExample = createUseQuery(exampleQueryFnWithParams, (props) => ({
    queryKey: ["example", props.page],
    enabled: (props?.page || 0) > 0,
}));

const useQueryObjectWithParamsExample = createUseQuery(exampleQueryFnWithParams, {
    queryKey: ["example", "object"],
})

function useQueryWithParamsExampleCLengthSelector(props: ExampleQueryFnWithParamsProps) {
    return useQueryWithParamsCallBackExample({
        props,
        options: {
            select: (data) => data.c.length,
            queryKey: ["length"]
        }
    });
}

const useQueryWithoutParamsExample = createUseQuery(exampleQueryFnWithoutParams, {
    queryKey: ["example", "no-params"],
});





export default function PageClient() {
    const { data: dataA } = useQueryWithParamsCallBackExample({
        props: { page: 1 }
    });
    const { data: dataB } = useQueryObjectWithParamsExample({
        props: {}
    });
    const { data: dataC } = useQueryWithParamsExampleCLengthSelector({ page: 2 });
    const { data: dataD } = useQueryWithoutParamsExample();
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

import { dialog, DialogRendererProps } from "@/registry/lib/dynamic-dialog-state";
import { AlertDialogCancel, AlertDialogContent, AlertDialogFooter } from "@/registry/ui/alert-dialog";
import { Button } from "@/registry/ui/button";

interface TestDialogProps extends DialogRendererProps<string> { }

function TestDialog(props: TestDialogProps) {
    return (
        <AlertDialogContent>
            <div className="p-4">
                <h2 className="text-lg font-medium">Test Dialog</h2>
                <p className="mt-2">This is a test dialog</p>
            </div>
            <AlertDialogFooter>
                <AlertDialogCancel>
                    Cancel
                </AlertDialogCancel>
                <Button onClick={()=>props.confirm('abc')}>
                    Confirm
                </Button>
            </AlertDialogFooter>
        </AlertDialogContent>
    );
}

export const testDialog = dialog(TestDialog);

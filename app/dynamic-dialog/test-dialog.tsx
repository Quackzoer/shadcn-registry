import { dialog, DialogRendererProps } from "@/registry/lib/dynamic-dialog-state";

interface TestDialogProps extends DialogRendererProps<string> {}

function TestDialog(props: TestDialogProps){
    return <div>Test Dialog</div>;
}

export const testDialog = dialog(TestDialog);

testDialog();
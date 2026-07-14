import { dialog, type DialogActions } from "@/lib/dynamic-dialog-state";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogFooter } from "@/registry/ui/alert-dialog";
import { Button } from "@/registry/ui/button";

function TestDialog(props: DialogActions<string>) {
  return (
    <AlertDialog open={props.open} onOpenChange={props.onOpenChange}>
      <AlertDialogContent>
        <div className="p-4">
          <h2 className="text-lg font-medium">Test Dialog</h2>
          <p className="mt-2">This is a test dialog</p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button onClick={() => props.confirm('abc')}>Confirm</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const testDialog = dialog(TestDialog);

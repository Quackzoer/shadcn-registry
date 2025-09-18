import { FormMessage, FormField } from "~/components/ui/form";
import type { DialogRenderProps } from "../types";
import { Form, FormItem, FormLabel, FormControl } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export function TypeToConfirmDialog(props: DialogRenderProps & { itemName: string }) {
  const schema = z.object({
    itemName: z.literal(props.itemName)
  })
  const form = useForm({
    resolver: zodResolver(schema)
  })

  const handleSubmit = () => {
    props.confirm();
  }

  const isFormValid = form.formState.isValid && form.watch('itemName') === props.itemName;

  return (
    <div className="bg-card rounded-lg shadow-xl max-w-md w-full mx-4 p-6 border">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Delete Confirmation</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-foreground mb-3">
                To confirm deletion of <code className="bg-muted px-2 py-1 rounded text-sm font-mono">{props.itemName}</code>, please type the exact name below:
              </p>

              <FormField
                control={form.control}
                name="itemName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Type to confirm</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={`Type: ${props.itemName}`}
                        {...field}
                        className="font-mono"
                        autoComplete="off"
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('itemName') && form.watch('itemName') !== props.itemName && (
                <p className="text-sm text-muted-foreground mt-2">
                  Text must match exactly: <span className="font-mono">{props.itemName}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => props.cancel()}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-md transition-colors ${
                isFormValid
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
              disabled={!isFormValid}
            >
              Delete Forever
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
}
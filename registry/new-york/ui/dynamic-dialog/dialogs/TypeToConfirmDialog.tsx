"use client"

import { Button } from "@/registry/new-york/ui/button";
import { DialogDescription, DialogHeader, DialogTitle } from "@/registry/new-york/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/registry/new-york/ui/form";
import { Input } from "@/registry/new-york/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { type DialogRendererProps } from "@/registry/new-york/lib/dynamic-dialog/types";

export interface TypeToConfirmDialogProps {
  itemName: string;
}

export function TypeToConfirmDialog(props: TypeToConfirmDialogProps & DialogRendererProps<{itemName: string}>) {
  const schema = z.object({
    itemName: z.literal(props.itemName)
  })
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      itemName: ''
    }
  })

  const handleSubmit = (data: z.infer<typeof schema>) => {
    props.confirm(data);
  }

  const isFormValid = form.formState.isValid && form.watch('itemName') === props.itemName;

  return (
    <div>
      <DialogHeader>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <DialogTitle className="text-lg font-semibold text-foreground">
              Delete Confirmation
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              This action cannot be undone
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div>
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
            <Button
              type="button"
              onClick={() => props.cancel()}
              variant={"outline"}
            >
              Cancel
            </Button>
            <Button
              variant={"destructive"}
              type="submit"
              disabled={!isFormValid}
            >
              Delete Forever
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
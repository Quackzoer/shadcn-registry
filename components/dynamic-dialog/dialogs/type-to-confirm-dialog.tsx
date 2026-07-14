"use client"

import React, { useId } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/registry/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/registry/ui/form";
import { Input } from "@/registry/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { dialog, type DialogComponentProps } from "@/registry/lib/dynamic-dialog-state";
import {
  type DialogActionButton,
  type DialogActionsContainer,
  renderStandardDialogActions,
} from "@/lib/dynamic-dialog-actions";

export interface TypeToConfirmDialogProps {
  itemName: string;
  actions?: TypeToConfirmActionsConfig;
}

type ResolveValue = { itemName: string };
type TCtx = { isValid: boolean };

// The confirm slot's disabled state comes from form validity — passed as context.
// Users who override confirmButton with a callback receive (actions, ctx) where
// ctx.isValid reflects the current input state.
export interface TypeToConfirmActionsConfig {
  cancelButton?: DialogActionButton<ResolveValue, TCtx>;
  confirmButton?: DialogActionButton<ResolveValue, TCtx>;
  container?: DialogActionsContainer<ResolveValue, TCtx>;
}

export function TypeToConfirmDialog(
  props: DialogComponentProps<TypeToConfirmDialogProps, ResolveValue>,
) {
  const formId = useId();
  const schema = z.object({ itemName: z.literal(props.itemName) });
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { itemName: "" } });

  const handleSubmit = (data: z.infer<typeof schema>) => {
    props.confirm(data);
  };

  const ctx: TCtx = { isValid: form.formState.isValid };

  return (
    <AlertDialog open={props.open} onOpenChange={props.onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle className="text-lg font-semibold text-foreground">
                Delete Confirmation
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-muted-foreground">
                This action cannot be undone
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <Form {...form}>
          <form id={formId} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="mb-4">
              <p className="text-foreground mb-3">
                To confirm deletion of{" "}
                <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                  {props.itemName}
                </code>
                , please type the exact name below:
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
              {form.watch("itemName") && form.watch("itemName") !== props.itemName && (
                <p className="text-sm text-muted-foreground mt-2">
                  Text must match exactly:{" "}
                  <span className="font-mono">{props.itemName}</span>
                </p>
              )}
            </div>
          </form>
        </Form>

        {renderStandardDialogActions(
          props.actions ?? {},
          props,
          ctx,
          {
            cancel: {
              label: "Cancel",
              variant: "outline",
              type: "button",
              onClick: (a) => a.dismiss("cancel"),
            },
            confirm: {
              label: "Delete Forever",
              variant: "destructive",
              type: "submit",
              form: formId,
              // Disabled state comes from context so users who override this slot
              // via the callback form also receive ctx.isValid.
              disabled: !ctx.isValid,
            },
          },
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const typeToConfirmDialog = dialog(TypeToConfirmDialog);

import { FormMessage, FormField, Form, FormItem, FormLabel, FormControl } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { DialogRenderProps } from "../types";

interface InputDialogProps extends DialogRenderProps {
  inputType?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  schema?: z.ZodSchema<any>;
  description?: string;
}

export function InputDialog(props: InputDialogProps) {
  // Use provided schema or build a default one based on inputType
  let inputSchema: z.ZodSchema<any> = z.string();
  if(props.schema) inputSchema = props.schema;
  

  const formSchema = z.object({
    input: inputSchema
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      input: props.defaultValue || ''
    }
  });

  const handleSubmit = (data: { input: string }) => {
    props.confirm(data.input);
  };

  const handleCancel = () => {
    props.cancel();
  };

  

  return (
    <div className="bg-card rounded-lg shadow-xl max-w-md w-full mx-4 p-6 border">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">{props.title || 'Input Required'}</h3>
              {props.description && (
                <p className="text-sm text-muted-foreground">{props.description}</p>
              )}
            </div>
          </div>

          {/* Message */}
          {props.message && (
            <p className="text-foreground mb-4">{props.message}</p>
          )}

          {/* Input Field */}
          <FormField
            control={form.control}
            name="input"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  {props.inputType === 'email' && 'Email Address'}
                  {props.inputType === 'password' && 'Password'}
                  {props.inputType === 'url' && 'URL'}
                  {props.inputType === 'tel' && 'Phone Number'}
                  {props.inputType === 'number' && 'Number'}
                  {(!props.inputType || props.inputType === 'text') && 'Value'}
                </FormLabel>
                <FormControl>
                  <Input
                    type='text'
                    placeholder={props.placeholder || `Enter text here...`}
                    {...field}
                    autoComplete="off"
                    autoFocus
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Schema Info - could be enhanced to show schema requirements */}
          {props.description && (
            <div className="text-sm text-muted-foreground">
              <p>{props.description}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!form.formState.isValid}
              className={`px-4 py-2 rounded-md transition-colors ${
                form.formState.isValid
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              Submit
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
}
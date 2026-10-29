import z from "zod";
import { formOptions } from "@tanstack/react-form";
import { withForm } from "@/registry/tanstack-form/hooks/use-app-form";

const step1Schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
})

const step2Schema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
})

const wizardFormOpts = formOptions({
  defaultValues: {
    step1: {
      name: '',
    },
    step2: {
      name: '',
    },
  },
})

const Step1Form = withForm({
  ...wizardFormOpts,
  props: {
    step: 0,
    setStep: (_step: number) => {},
  },
  render: function Render({ form, step, setStep }) {
    return (
      <form.FormGroup
        name="step1"
        validators={{
          onDynamic: step1Schema,
        }}
        onGroupSubmit={({ value: _value }) => {
          setStep(step + 1)
        }}
        onGroupSubmitInvalid={() => {
          // Just like a form, you can also handle invalid submits at the group level, which is useful for multi-step wizards to prevent going to the next step if the current step is invalid
        }}
      >
        {(formGroup) => (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              formGroup.handleSubmit()
            }}
          >
            <form.AppField name="step1.name">
              {(field) => <field.Text />}
            </form.AppField>

            <form.AppForm>
              <form.SubscribeButton label="Submit" />
            </form.AppForm>
            {/* formGroup contains errorMaps and errors, just like forms and fields */}
            <pre>{JSON.stringify(formGroup.state.meta.errorMap, null, 2)}</pre>
          </form>
        )}
      </form.FormGroup>
    )
  },
})
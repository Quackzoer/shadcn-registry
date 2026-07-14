import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";
import { Button } from "./button";
import { FormApi } from "@tanstack/react-form";
import { cn } from "@/lib/utils"; // Assumes your project's cn utility

interface MultiStepFormContextType {
    currentStepIndex: number;
    totalSteps: number;
    isFirstStep: boolean;
    isLastStep: boolean;
    next: () => Promise<boolean>;
    prev: () => void;
    goTo: (index: number) => void;
    isSubmitting: boolean;
}

const MultiStepFormContext = React.createContext<MultiStepFormContextType | null>(null);

export function useMultiStepForm() {
    const context = React.useContext(MultiStepFormContext);
    if (!context) {
        throw new Error("useMultiStepForm must be used within a <MultiStepForm /> provider");
    }
    return context;
}

interface MultiStepFormProps<T extends Record<string, any>> {
    form: FormApi<T, any, any, any, any, any, any, any, any, any, any, any>;
    children: React.ReactNode;
    /**
     * An array of field name arrays, corresponding to each step.
     * Tells the orchestrator which fields to trigger validation for
     * before allowing a transition to the next step.
     */
    stepFields: (keyof T)[][];
    className?: string;
}

export function MultiStepForm<T extends Record<string, any>>({
    form,
    children,
    stepFields,
    className,
}: Readonly<MultiStepFormProps<T>>) {
    const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
    const childrenArray = React.Children.toArray(children);
    const totalSteps = childrenArray.length;

    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === totalSteps - 1;

    // Reactively subscribe to form state using TanStack's useStore hook
    const isSubmitting = form.useStore((state) => state.isSubmitting);
    const fieldMeta = form.useStore((state) => state.fieldMeta);

    // Automatically route back to the first step with an error if submission fails
    React.useEffect(() => {
        // Collect keys of fields that currently have validation errors
        const errorFields = Object.keys(fieldMeta).filter((fieldName) => {
            const meta = fieldMeta[fieldName];
            return meta?.errors && meta.errors.length > 0;
        });

        if (errorFields.length === 0) return;

        // Find the first step index that contains one of the invalid fields
        const firstInvalidStepIndex = stepFields.findIndex((fields) =>
            fields.some((field) => errorFields.includes(field as string))
        );

        // Jump to the invalid step safely
        if (firstInvalidStepIndex !== -1 && firstInvalidStepIndex !== currentStepIndex) {
            setCurrentStepIndex(firstInvalidStepIndex);
        }
    }, [fieldMeta, stepFields, currentStepIndex]);

    const next = async () => {
        if (isLastStep) return false;
        const fieldsToValidate = stepFields[currentStepIndex];

        // Manually trigger validation for all fields in the current step
        await Promise.all(
            fieldsToValidate.map((field) => form.validateField(field as any, "submit"))
        );

        // Read fresh field validation state
        const currentFieldMeta = form.state.fieldMeta;
        const hasErrors = fieldsToValidate.some((field) => {
            const meta = currentFieldMeta[field as string];
            return meta?.errors && meta.errors.length > 0;
        });

        if (!hasErrors) {
            setCurrentStepIndex((prev) => prev + 1);
            return true;
        }
        return false;
    };

    const prev = () => {
        if (isFirstStep) return;
        setCurrentStepIndex((prev) => prev - 1);
    };

    const goTo = (index: number) => {
        if (index >= 0 && index < totalSteps) {
            setCurrentStepIndex(index);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // In TanStack Form, the submission handler is defined inside your hook initialization: useForm({ onSubmit })
        form.handleSubmit();
    };

    return (
        <MultiStepFormContext.Provider
            value={{
                currentStepIndex,
                totalSteps,
                isFirstStep,
                isLastStep,
                next,
                prev,
                goTo,
                isSubmitting,
            }}
        >
            <form onSubmit={handleFormSubmit} className={cn("space-y-6", className)}>
                {childrenArray.map((child, index) => {
                    if (!React.isValidElement(child)) return null;
                    return React.cloneElement(child as React.ReactElement<MultiStepFormStepProps>, {
                        stepIndex: index,
                        active: index === currentStepIndex,
                    });
                })}
            </form>
        </MultiStepFormContext.Provider>
    );
}


interface MultiStepFormStepProps {
    children: React.ReactNode;
    stepIndex?: number; // Injected by parent
    active?: boolean;   // Injected by parent
    className?: string;
}

export function MultiStepFormStep({
    children,
    active,
    className,
}: Readonly<MultiStepFormStepProps>) {
    if (!active) return null;

    return (
        <div className={cn("animate-in fade-in-50 slide-in-from-bottom-2 duration-200", className)}>
            {children}
        </div>
    );
}

// Optional navigation utility component
export function MultiStepNavigation() {
    const { isFirstStep, isLastStep, prev, next, isSubmitting } = useMultiStepForm();

    return (
        <div className="flex justify-between items-center pt-4 border-t border-border">
            <Button
                type="button"
                variant="ghost"
                onClick={prev}
                disabled={isFirstStep || isSubmitting}
            >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
            </Button>

            {isLastStep ? (
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit"}
                    <Check className="ml-2 h-4 w-4" />
                </Button>
            ) : (
                <Button type="button" onClick={next}>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
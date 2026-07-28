import { createContext, useContext, useMemo, type ReactNode } from "react";
import { RequiredAsterisk } from "../components/fields/field-label";

export interface FormMetaContext {
  renderRequired: React.ReactNode | ((required?: boolean) => React.ReactNode);
}

const defaultFormMetaContext: FormMetaContext = {
  renderRequired: RequiredAsterisk,
};

export const formMetaContext = createContext<FormMetaContext>(defaultFormMetaContext);

export interface FormMetaProviderProps {
  value?: Partial<FormMetaContext>;
  children: ReactNode;
}

export function FormMetaProvider({ value, children }: FormMetaProviderProps) {
  const parent = useContext(formMetaContext);
  const merged = useMemo(() => ({ ...parent, ...value }), [parent, value]);

  return (
    <formMetaContext.Provider value={merged}>
      {children}
    </formMetaContext.Provider>
  );
}

export function useFormMetaContext() {
  return useContext(formMetaContext);
}

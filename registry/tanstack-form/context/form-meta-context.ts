import { createContext, useContext } from "react";
import { RequiredAsterisk } from "../components/fields/field-label";

interface FormMetaContext {
  renderRequired: React.ReactNode | ((required?: boolean) => React.ReactNode);
}

export const formMetaContext = createContext<FormMetaContext|null>({
  //   renderRequired: (required) => RequiredText({ required }),
  renderRequired: RequiredAsterisk,
});

export const FormMetaProvider = formMetaContext.Provider;

export function useFormMetaContext() {
  const ctx = useContext(formMetaContext);
  if (!ctx)
    console.error(
      "useFormMetaContext can be used only within FormMetaProvider/FormMeta component",
    );
  return ctx;
}

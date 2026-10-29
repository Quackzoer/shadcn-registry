'use client'

import { DetailedHTMLProps, FormHTMLAttributes } from "react"
import { FormMetaContext, FormMetaProvider } from "../../context/form-meta-context"

interface FormProps extends DetailedHTMLProps<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> {
    value?: FormMetaContext
}

export function Form({ value, ...props }: Readonly<FormProps>) {
    return <FormMetaProvider value={value}>
        <form  {...props} />
    </FormMetaProvider>
}
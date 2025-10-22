"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import PageClient from "./page.client"

const queryClient = new QueryClient();

export default function Page() {
  return (
    <QueryClientProvider client={queryClient}>
      <PageClient />
    </QueryClientProvider>
  )
}

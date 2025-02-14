'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm, FormProvider } from "react-hook-form";
import { SidebarProvider } from './SidebarContext'


export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const methods = useForm();

  return (
    <QueryClientProvider client={queryClient}>
      <FormProvider {...methods}>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </FormProvider>
    </QueryClientProvider>
  )
}

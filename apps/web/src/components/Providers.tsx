"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminProvider } from "@/contexts/AdminContext";
import { SessionProvider } from "next-auth/react";
import { registerMocks } from "@/lib/mock-api";

if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  registerMocks();
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <SessionProvider>
      <NextThemesProvider {...props}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <AdminProvider>
              {children}
              <Toaster />
              <Sonner />
            </AdminProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </NextThemesProvider>
    </SessionProvider>
  );
}

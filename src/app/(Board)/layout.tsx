// (Board) layout: this is a nested layout — it must NOT render <html> or <body>.
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

// Create a QueryClient instance (can be module-scoped)
const queryClient = new QueryClient();

export default function BoardLayout({ children }: { children: ReactNode }) {
  // Return only the layout content — no <html> or <body> tags here.
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

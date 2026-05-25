"use client";

import { SupabaseAuthProvider } from "@/components/supabase-auth-context";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <SupabaseAuthProvider>{children}</SupabaseAuthProvider>;
}

"use client";

import { FirebaseAuthProvider } from "@/components/firebase-auth-context";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <FirebaseAuthProvider>{children}</FirebaseAuthProvider>;
}

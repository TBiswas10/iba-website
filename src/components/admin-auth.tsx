"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/supabase-auth-context";

interface AdminAuthProps {
  children: ReactNode;
}

export function AdminAuth({ children }: AdminAuthProps) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/membership");
      return;
    }
    if (user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <section className="panel-stack">
        <section className="glass-panel">
          <p>Loading...</p>
        </section>
      </section>
    );
  }

  if (!user) {
    router.push("/membership");
    return null;
  }

  if (user.role !== "ADMIN") {
    router.push("/dashboard");
    return null;
  }

  return <>{children}</>;
}

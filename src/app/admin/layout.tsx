"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminBottomNav } from "@/components/admin-bottom-nav";
import { useAuth } from "@/components/supabase-auth-context";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "ADMIN")) {
      router.replace("/membership");
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <main className="admin-main">
        {children}
        <div className="admin-bottom-spacer" />
      </main>
      <AdminBottomNav />
    </div>
  );
}

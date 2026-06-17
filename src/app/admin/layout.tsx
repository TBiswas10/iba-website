"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminBottomNav } from "@/components/admin-bottom-nav";
import { useAuth } from "@/components/supabase-auth-context";

function AdminShellSkeleton() {
  return (
    <div className="admin-shell">
      <AdminSidebar skeleton />
      <main className="admin-main">
        {/* stat cards */}
        <div className="admin-page-header">
          <div className="skeleton skeleton-heading" style={{ width: 180 }} />
          <div className="skeleton skeleton-line" style={{ width: 130, marginTop: 6 }} />
        </div>
        <div className="admin-stat-strip">
          {[1,2,3,4].map(i => (
            <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />
          ))}
        </div>
        <div className="admin-panels-row" style={{ marginTop: "1.5rem" }}>
          <div className="skeleton" style={{ height: 220, borderRadius: 16 }} />
          <div className="skeleton" style={{ height: 220, borderRadius: 16 }} />
        </div>
        <div className="admin-bottom-spacer" />
      </main>
      <AdminBottomNav />
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "ADMIN")) {
      router.replace("/membership");
    }
  }, [user, loading, router]);

  if (loading) {
    return <AdminShellSkeleton />;
  }

  if (!user || user.role !== "ADMIN") {
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

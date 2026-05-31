"use client";

import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminBottomNav } from "@/components/admin-bottom-nav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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

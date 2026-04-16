"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

type User = {
  uid: string;
  email: string;
  role: string;
};

interface AdminAuthProps {
  children: ReactNode;
}

export function AdminAuth({ children }: AdminAuthProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/session")
      .then(res => res.json())
      .then(data => {
        if (!data.user) {
          router.push("/membership");
          return;
        }
        if (data.user.role !== "ADMIN") {
          router.push("/dashboard");
          return;
        }
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        router.push("/membership");
      });
  }, [router]);

  if (loading || !user) {
    return (
      <section className="panel-stack">
        <section className="glass-panel">
          <p>Loading...</p>
        </section>
      </section>
    );
  }

  return <>{children}</>;
}
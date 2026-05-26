"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";

type AppUser = {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  supabaseUserId: string;
  membershipStatus?: string | null;
  membershipExpiry?: string | null;
};

type AuthContextType = {
  user: AppUser | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => setLoading(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  async function syncUser() {
    try {
      const res = await fetch("/api/session");
      const data = await res.json();
      if (data.user) setUser(data.user);
    } catch {
      // will retry on next auth event
    }
  }

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        await syncUser();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        syncUser().finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signInWithEmail(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  }

  async function logout() {
    try {
      await supabase.auth.signOut();
    } catch {
      // still clear local state
    }
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signInWithEmail, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within SupabaseAuthProvider");
  }
  return context;
}

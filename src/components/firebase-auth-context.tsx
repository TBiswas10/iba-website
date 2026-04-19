"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { getFirebaseAuth, getGoogleProvider, getEmailProvider } from "@/lib/firebase";

type FirebaseUser = User & {
  role?: string;
};

type AuthContextType = {
  user: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        const res = await fetch("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
          cache: "no-store",
        });
        const data = await res.json();
        
        if (data.user) {
          setUser({ ...firebaseUser, role: data.user.role } as FirebaseUser);
        } else {
          // AUTO-SYNC: If user exists in Firebase but not in our DB (e.g. after a reset)
          // we call signup to recreate the record and establish the session.
          await fetch("/api/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: firebaseUser.email,
              name: firebaseUser.displayName || firebaseUser.email?.split("@")[0],
            }),
          });
          
          // Now that the user is created, call session again to get the cookie
          const retryRes = await fetch("/api/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });
          const retryData = await retryRes.json();
          setUser({ ...firebaseUser, role: retryData.user?.role || "USER" } as FirebaseUser);
        }
      } else {
        // Clear cookie via API
        await fetch("/api/session", { method: "DELETE" });
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function signInWithGoogle() {
    const auth = getFirebaseAuth();
    const googleProvider = getGoogleProvider();
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      // Sync with our database
      await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: result.user.email,
          name: result.user.displayName || result.user.email?.split("@")[0],
        }),
      });
    }
  }

  async function signInWithEmail(email: string, password: string) {
    const auth = getFirebaseAuth();
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signUpWithEmail(email: string, password: string, name: string) {
    const auth = getFirebaseAuth();
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
  }

  async function logout() {
    const auth = getFirebaseAuth();
    await signOut(auth);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useFirebaseAuth must be used within FirebaseAuthProvider");
  }
  return context;
}
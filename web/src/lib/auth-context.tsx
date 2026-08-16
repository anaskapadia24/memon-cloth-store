"use client";

import {
  createContext,
  useContext,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { logoutAction } from "./actions/auth";
import type { User } from "./types";

interface AuthContextValue {
  user: User | null;
  isPending: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// `user` comes from the server (RootLayout reads the session cookie) - after
// login/logout we revalidate + router.refresh() so this prop updates itself,
// no client-side state duplication needed.
export function AuthProvider({
  user,
  children,
}: {
  user: User | null;
  children: ReactNode;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function logout() {
    startTransition(async () => {
      await logoutAction();
      router.push("/");
      router.refresh();
    });
  }

  return (
    <AuthContext.Provider value={{ user, isPending, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, getToken, setToken } from "./api.ts";

export type AdminUser = {
  _id: string;
  name: string;
  email: string;
  role?: string;
};

type AuthState = {
  user: AdminUser | null;
  ready: boolean;
  signIn: (emailOrPhone: string, password: string) => Promise<void>;
  signOut: () => void;
};

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      setReady(true);
      return;
    }
    api<AdminUser>("/auth/me")
      .then((u) => {
        if (u.role !== "admin") {
          setToken("");
          setUser(null);
          return;
        }
        setUser(u);
      })
      .catch(() => {
        setToken("");
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  async function signIn(emailOrPhone: string, password: string) {
    const data = await api<{ token: string }>("/auth/admin-login", {
      method: "POST",
      body: JSON.stringify({ emailOrPhone, password }),
    });
    setToken(data.token);
    const me = await api<AdminUser>("/auth/me");
    if (me.role !== "admin") {
      setToken("");
      throw new Error("Admin access required");
    }
    setUser(me);
  }

  function signOut() {
    setToken("");
    setUser(null);
  }

  return (
    <Ctx.Provider value={{ user, ready, signIn, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}

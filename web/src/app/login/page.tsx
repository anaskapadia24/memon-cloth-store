"use client";

import { useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  loginAction,
  registerAction,
  googleLoginAction,
} from "@/lib/actions/auth";
import { GoogleSignInButton } from "@/components/google-signin-button";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";

  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const [login, setLogin] = useState({ emailOrPhone: "", password: "" });
  const [register, setRegister] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  function afterAuth() {
    router.push(next);
    router.refresh();
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await loginAction(login.emailOrPhone, login.password);
      if (result.ok) afterAuth();
      else setError(result.error);
    });
  }

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await registerAction(
        register.name,
        register.email,
        register.phone,
        register.password,
      );
      if (result.ok) afterAuth();
      else setError(result.error);
    });
  }

  function handleGoogle(credential: string) {
    setError("");
    startTransition(async () => {
      const result = await googleLoginAction(credential);
      if (result.ok) afterAuth();
      else setError(result.error);
    });
  }

  return (
    <section className="auth-page">
      <div className="auth-box">
        <div className="auth-header">
          <Image
            src="/Memon_logo.png"
            alt="Memon Cloth Store"
            width={56}
            height={56}
            style={{ height: 56, width: 56, margin: "0 auto 16px" }}
          />
          <h2>{mode === "login" ? "Welcome Back" : "Create an Account"}</h2>
          <p>
            {mode === "login"
              ? "Log in to manage your orders"
              : "Join us for a better shopping experience"}
          </p>
        </div>

        <div className="auth-body">
          <div className="auth-tabs">
            <button
              className={`auth-tab${mode === "login" ? " active" : ""}`}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              className={`auth-tab${mode === "register" ? " active" : ""}`}
              onClick={() => setMode("register")}
            >
              Register
            </button>
          </div>

          {error && <div className="auth-error">{error}</div>}

          {mode === "login" ? (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email or Phone</label>
                <input
                  value={login.emailOrPhone}
                  onChange={(e) =>
                    setLogin((f) => ({ ...f, emailOrPhone: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={login.password}
                  onChange={(e) =>
                    setLogin((f) => ({ ...f, password: e.target.value }))
                  }
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={isPending}
              >
                {isPending ? "Logging in..." : "Log In"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  value={register.name}
                  onChange={(e) =>
                    setRegister((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={register.email}
                  onChange={(e) =>
                    setRegister((f) => ({ ...f, email: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={register.phone}
                  onChange={(e) =>
                    setRegister((f) => ({ ...f, phone: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  minLength={6}
                  value={register.password}
                  onChange={(e) =>
                    setRegister((f) => ({ ...f, password: e.target.value }))
                  }
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={isPending}
              >
                {isPending ? "Creating account..." : "Create Account"}
              </button>
            </form>
          )}

          <div className="auth-divider">
            <span>or</span>
          </div>
          <GoogleSignInButton onCredential={handleGoogle} />

          <p className="auth-foot-note">
            By continuing you agree to our{" "}
            <Link href="/terms-of-service">Terms of Service</Link> and{" "}
            <Link href="/privacy-policy">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

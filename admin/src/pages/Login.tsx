import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { ThemeToggle } from "../components/ThemeToggle.tsx";
import { useAuth } from "../lib/auth.tsx";

export function Login() {
  const { user, ready, signIn } = useAuth();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!ready) return <div className="boot-screen">Loading…</div>;
  if (user) return <Navigate to="/" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(false);
    try {
      await signIn(emailOrPhone, password);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-theme">
        <ThemeToggle />
      </div>
      <form className="login-box" onSubmit={(e) => void onSubmit(e)}>
        <img src="/Memon_logo.png" alt="Memon Cloth Store" className="logo" />
        <h2>Admin Panel</h2>
        <p>Sign in with your admin account to manage the store</p>
        <div className="form-group">
          <label>Email or Phone</label>
          <input
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            placeholder="Enter admin email or phone"
            autoComplete="username"
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            autoComplete="current-password"
          />
        </div>
        <button
          className="btn btn-primary btn-full"
          type="submit"
          disabled={busy}
        >
          <i className="fas fa-sign-in-alt" /> Login
        </button>
        <p className={`login-error ${error ? "show" : ""}`}>
          <i className="fas fa-exclamation-circle" /> Incorrect credentials. Try
          again.
        </p>
      </form>
    </div>
  );
}

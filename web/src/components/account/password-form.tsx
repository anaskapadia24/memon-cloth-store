"use client";

import { useState, useTransition } from "react";
import { changePasswordAction } from "@/lib/actions/auth";

export function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (next !== confirm) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }
    startTransition(async () => {
      const result = await changePasswordAction(current, next);
      if (result.ok) {
        setMessage({ type: "ok", text: "Password changed successfully" });
        setCurrent("");
        setNext("");
        setConfirm("");
      } else {
        setMessage({ type: "error", text: result.error });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Current Password</label>
        <input
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          required
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            minLength={6}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Confirm New Password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>
      </div>
      {message && (
        <p className={message.type === "error" ? "form-error" : "form-success"}>
          {message.text}
        </p>
      )}
      <button type="submit" className="btn btn-primary" disabled={isPending}>
        <i className="fas fa-key" />{" "}
        {isPending ? "Changing..." : "Change Password"}
      </button>
    </form>
  );
}

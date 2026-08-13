"use client";

import { useState, useTransition } from "react";
import { updateProfileAction } from "@/lib/actions/auth";
import type { User } from "@/lib/types";

export function ProfileForm({ user }: { user: User }) {
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
  });
  const [message, setMessage] = useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await updateProfileAction(
        form.name,
        form.email,
        form.phone,
      );
      setMessage(
        result.ok
          ? { type: "ok", text: "Profile updated" }
          : { type: "error", text: result.error },
      );
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>Full Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
        <div className="form-group">
          <label>Phone Number</label>
          <input
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            required
          />
        </div>
      </div>
      <div className="form-group">
        <label>Email Address</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          required
        />
      </div>
      {message && (
        <p className={message.type === "error" ? "form-error" : "form-success"}>
          {message.text}
        </p>
      )}
      <button type="submit" className="btn btn-primary" disabled={isPending}>
        <i className="fas fa-save" />{" "}
        {isPending ? "Saving..." : "Update Profile"}
      </button>
    </form>
  );
}

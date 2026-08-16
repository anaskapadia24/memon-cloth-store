"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteAccountAction } from "@/lib/actions/auth";

export function DangerZone() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (
      !confirm(
        "Delete your account? This cannot be undone - your personal info will be removed, but past orders are kept for invoicing.",
      )
    ) {
      return;
    }
    startTransition(async () => {
      const result = await deleteAccountAction();
      if (result.ok) {
        router.push("/");
        router.refresh();
      }
    });
  }

  return (
    <div>
      <p
        style={{
          color: "var(--gray-700)",
          fontSize: "0.9rem",
          marginBottom: 16,
        }}
      >
        Deleting your account removes your personal information from our
        systems. Past orders are kept for invoicing and legal record-keeping, as
        described in our <Link href="/privacy-policy">Privacy Policy</Link>.
      </p>
      <button
        className="btn btn-outline"
        style={{ borderColor: "var(--danger)", color: "var(--danger)" }}
        onClick={handleDelete}
        disabled={isPending}
      >
        {isPending ? "Deleting..." : "Delete My Account"}
      </button>
    </div>
  );
}

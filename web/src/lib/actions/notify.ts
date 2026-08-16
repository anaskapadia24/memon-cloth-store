"use server";

import { apiFetch, ApiError } from "../api";
import type { ActionResult } from "../types";

export async function notifyMeAction(
  productId: string,
  email: string,
): Promise<ActionResult> {
  try {
    await apiFetch(`/products/${productId}/notify-me`, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    return { ok: true, data: undefined };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof ApiError ? err.message : "Something went wrong",
    };
  }
}

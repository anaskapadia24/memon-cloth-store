"use server";

import { apiFetch, ApiError } from "../api";
import { getToken } from "../session";
import type { ActionResult } from "../types";

export async function createReviewAction(
  productId: string,
  rating: number,
  comment: string,
  images: File[],
): Promise<ActionResult> {
  try {
    const token = await getToken();
    const fd = new FormData();
    fd.append("productId", productId);
    fd.append("rating", String(rating));
    fd.append("comment", comment);
    images.forEach((file) => fd.append("images", file, file.name));

    await apiFetch("/reviews", { method: "POST", token, body: fd });
    // Doesn't show up publicly yet (pending approval), but the product's
    // own cache doesn't need dropping until an admin approves it.
    return { ok: true, data: undefined };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof ApiError ? err.message : "Failed to submit review",
    };
  }
}

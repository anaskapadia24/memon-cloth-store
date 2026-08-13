"use server";

import { updateTag } from "next/cache";
import { apiFetch, ApiError } from "../api";
import { getToken } from "../session";
import type { ActionResult } from "../types";

export async function createReviewAction(
  productId: string,
  rating: number,
  comment: string,
): Promise<ActionResult> {
  try {
    const token = await getToken();
    await apiFetch("/reviews", {
      method: "POST",
      token,
      body: JSON.stringify({ productId, rating, comment }),
    });
    updateTag(`reviews:${productId}`);
    updateTag(`product:${productId}`);
    return { ok: true, data: undefined };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof ApiError ? err.message : "Failed to submit review",
    };
  }
}

"use server";

import { apiFetch, ApiError } from "../api";
import { getToken } from "../session";
import type { ActionResult } from "../types";

interface RazorpayOrder {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export async function createRazorpayOrderAction(
  amount: number,
): Promise<ActionResult<RazorpayOrder>> {
  try {
    const token = await getToken();
    const order = await apiFetch<RazorpayOrder>("/payment/create-order", {
      method: "POST",
      token,
      body: JSON.stringify({ amount }),
    });
    return { ok: true, data: order };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof ApiError ? err.message : "Could not start payment",
    };
  }
}

export async function verifyPaymentAction(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<ActionResult> {
  try {
    const token = await getToken();
    await apiFetch("/payment/verify", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    });
    return { ok: true, data: undefined };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof ApiError ? err.message : "Payment verification failed",
    };
  }
}

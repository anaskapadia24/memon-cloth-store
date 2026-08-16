"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "../api";
import { getToken } from "../session";
import type { ActionResult, Order, OrderCustomer, OrderItem } from "../types";

export async function getMyOrders(): Promise<Order[]> {
  const token = await getToken();
  if (!token) return [];
  try {
    return await apiFetch<Order[]>("/orders/my-orders", {
      token,
      cache: "no-store",
    });
  } catch {
    return [];
  }
}

export async function createOrderAction(payload: {
  customer: OrderCustomer;
  items: OrderItem[];
  payment: string;
  notes?: string;
  paymentId?: string;
  coupon?: string;
}): Promise<ActionResult<Order>> {
  try {
    const token = await getToken();
    const order = await apiFetch<Order>("/orders", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    });
    revalidatePath("/account/orders");
    return { ok: true, data: order };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof ApiError ? err.message : "Failed to place order",
    };
  }
}

export async function cancelOrderAction(
  orderId: string,
): Promise<ActionResult> {
  try {
    const token = await getToken();
    await apiFetch(`/orders/${orderId}/cancel`, { method: "PUT", token });
    revalidatePath("/account/orders");
    return { ok: true, data: undefined };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof ApiError ? err.message : "Failed to cancel order",
    };
  }
}

export async function requestReturnAction(
  orderId: string,
  type: "replace" | "refund",
  reason: string,
): Promise<ActionResult> {
  try {
    const token = await getToken();
    await apiFetch(`/orders/${orderId}/return-request`, {
      method: "POST",
      token,
      body: JSON.stringify({ type, reason }),
    });
    revalidatePath("/account/orders");
    return { ok: true, data: undefined };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof ApiError
          ? err.message
          : "Failed to submit return request",
    };
  }
}

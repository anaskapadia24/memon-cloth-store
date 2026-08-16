import { apiFetch } from "./api";
import type { Promo, PromoQuote } from "./types";

export async function getPromos() {
  return apiFetch<Promo[]>("/promos", { tags: ["promos"] }).catch(
    () => [] as Promo[],
  );
}

export async function getUpcomingPromos() {
  return apiFetch<Promo[]>("/promos/upcoming", { tags: ["promos"] }).catch(
    () => [] as Promo[],
  );
}

export function promosAt(list: Promo[], place: string) {
  return list.filter((p) => (p.placements || []).includes(place));
}

export async function quotePromo(
  items: { id?: string; price: number; qty: number }[],
  coupon = "",
  extra?: { city?: string; pin?: string; payment?: string },
) {
  return apiFetch<PromoQuote>("/promos/quote", {
    method: "POST",
    body: JSON.stringify({ items, coupon, ...extra }),
  });
}

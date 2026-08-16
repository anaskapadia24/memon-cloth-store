import { useCallback, useEffect, useState } from "react";

export const API = import.meta.env.VITE_API_BASE || "/api";
export const STORE_URL =
  import.meta.env.VITE_STORE_URL || "http://localhost:3000";
const TOKEN_KEY = "memon_admin_token";

export const SIZES = ["S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"] as const;

export type SizeStock = { size: string; stock: number };
export type ProductColor = {
  name: string;
  images: string[];
  price?: number;
  stock: number;
  sizes: SizeStock[];
};
export type Product = {
  _id: string;
  sku?: string;
  name: string;
  cat: string;
  price: number;
  originalPrice?: number;
  desc?: string;
  img: string;
  images?: string[];
  badge?: string;
  featured?: boolean;
  comingSoon?: boolean;
  comingSoonKind?: "" | "launch" | "restock";
  comingSoonNote?: string;
  color?: string;
  fabric?: string;
  size?: string;
  setInclude?: string;
  work?: string;
  stock: number;
  sizes?: SizeStock[];
  colors?: ProductColor[];
  videos?: string[];
};
export type Category = { _id?: string; id: string; name: string };
export type Order = {
  _id: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    pin: string;
    state: string;
  };
  items: { name: string; price: number; qty: number }[];
  total: number;
  payment: string;
  paymentId?: string;
  paymentStatus?: string;
  shipping?: number;
  gst?: number;
  discount?: number;
  notes?: string;
  status: string;
  createdAt?: string;
  date?: string;
  trackingLocation?: string;
  trackingNotes?: string;
  trackingUpdatedAt?: string;
  shiprocket?: { awbCode?: string; courierName?: string; labelUrl?: string };
  returnRequest?: {
    requested?: boolean;
    type?: string;
    reason?: string;
    status?: string;
    returnAwbCode?: string;
    returnCourierName?: string;
  };
};
export type Review = {
  _id: string;
  productId?: string | { name?: string };
  userName?: string;
  name?: string;
  rating: number;
  comment?: string;
  text?: string;
  images?: string[];
  status?: "pending" | "approved" | "rejected";
  createdAt?: string;
  date?: string;
};
export type Customer = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  authProvider?: string;
  orderCount?: number;
  totalSpent?: number;
  couponsUsed?: number;
  createdAt?: string;
};
export type Stats = {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  totalCustomers: number;
};
export type Settings = {
  storeName?: string;
  tagline?: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  deliveryFee?: string;
  freeDeliveryMin?: string;
  freeDeliveryPins?: string;
  freeDeliveryCities?: string;
  gstPercent?: string;
  gstInclusive?: string;
  codFee?: string;
};

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}
export function setToken(token: string) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const getCache = new Map<string, { at: number; value: unknown }>();
const GET_TTL = 30_000;

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method || "GET").toUpperCase();
  if (method === "GET") {
    const hit = getCache.get(path);
    if (hit && Date.now() - hit.at < GET_TTL) return hit.value as T;
  } else {
    getCache.clear();
  }

  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (
    init.body &&
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(API + path, { ...init, headers });
  if (res.status === 401 && token && !path.includes("admin-login")) {
    setToken("");
    window.location.href = "/login";
    throw new ApiError("Unauthorized", 401);
  }
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new ApiError(data.error || res.statusText, res.status);
  }
  if (res.status === 204) return undefined as T;
  const json = (await res.json()) as T;
  if (method === "GET") getCache.set(path, { at: Date.now(), value: json });
  return json;
}

export async function downloadBlob(path: string, filename: string) {
  const headers = new Headers();
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(API + path, { headers });
  if (!res.ok) throw new ApiError("Download failed", res.status);
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function useAsync<T>(
  fn: () => Promise<T>,
  deps: readonly unknown[] = [],
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await fn());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => {
    void reload();
  }, [reload]);
  return { data, error, loading, reload };
}

export function orderId(o: { _id: string; id?: string }) {
  return (o._id || o.id || "").slice(-8).toUpperCase();
}

export function catName(categories: Category[], slug: string) {
  return categories.find((c) => c.id === slug)?.name || slug;
}

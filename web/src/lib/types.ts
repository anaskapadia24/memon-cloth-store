export type ActionResult<T = undefined> =
  { ok: true; data: T } | { ok: false; error: string };

export interface ProductSize {
  size: string;
  stock: number;
}

export interface ProductColor {
  name: string;
  images: string[];
  price?: number;
  stock: number;
  sizes: ProductSize[];
}

export interface Product {
  _id: string;
  sku: string;
  name: string;
  cat: string;
  price: number;
  originalPrice: number;
  desc: string;
  img: string;
  images: string[];
  badge: string;
  featured?: boolean;
  comingSoon?: boolean;
  comingSoonKind?: "" | "launch" | "restock";
  comingSoonNote?: string;
  color: string;
  fabric: string;
  size: string;
  setInclude: string;
  work: string;
  stock: number;
  sizes: ProductSize[];
  colors: ProductColor[];
  videos?: string[];
  avgRating: number;
  numReviews: number;
  createdAt: string;
}

export interface Category {
  _id: string;
  id: string;
  name: string;
}

export interface Address {
  _id: string;
  label: string;
  address: string;
  createdAt: string;
}

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone: string;
  role?: "customer" | "admin";
  addresses?: Address[];
  createdAt?: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  img: string;
  size?: string;
  color?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  size?: string;
  color?: string;
}

export interface OrderTracking {
  status: string;
  timestamp: string;
  location?: string;
  notes?: string;
}

export interface OrderCustomer {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  pin: string;
  state: string;
}

export interface ReturnRequest {
  requested: boolean;
  type: "replace" | "refund" | "";
  reason: string;
  status: "none" | "requested" | "approved" | "rejected" | "completed";
  requestedAt?: string;
  adminNotes: string;
}

export interface ShiprocketInfo {
  orderId: string;
  shipmentId: string;
  awbCode: string;
  courierName: string;
  labelUrl: string;
  status: string;
  estimatedDelivery: string;
}

export interface Order {
  _id: string;
  userId: string;
  customer: OrderCustomer;
  items: OrderItem[];
  total: number;
  discount?: number;
  promoTitle?: string;
  coupon?: string;
  shipping?: number;
  shippingNote?: string;
  gst?: number;
  gstPercent?: number;
  codFee?: number;
  payment: string;
  paymentStatus?: "cod" | "paid" | "unpaid";
  paymentId: string;
  notes: string;
  status:
    | "pending"
    | "packed"
    | "shipped"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";
  tracking: OrderTracking[];
  shiprocket?: ShiprocketInfo;
  returnRequest?: ReturnRequest;
  createdAt: string;
}

export interface Review {
  _id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  images?: string[];
  status?: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface Promo {
  _id: string;
  title: string;
  blurb: string;
  kind: "percent" | "bogo" | "flat" | "featured" | "banner" | "custom";
  percent: number;
  flatOff?: number;
  customRule?: string;
  minAmount: number;
  buyQty: number;
  payQty: number;
  coupon: string;
  placements: string[];
  productIds: string[];
  active: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
}

export interface PromoQuote {
  subtotal: number;
  discount: number;
  total: number;
  promo: { _id: string; title: string; kind: string; coupon: string } | null;
  error: string;
  shipping?: number;
  shippingNote?: string;
  gst?: number;
  gstPercent?: number;
  gstInclusive?: boolean;
  codFee?: number;
}

export interface Settings {
  storeName?: string;
  tagline?: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  [key: string]: string | undefined;
}

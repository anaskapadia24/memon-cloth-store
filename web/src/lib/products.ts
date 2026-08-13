import { apiFetch } from "./api";
import type { Category, Product, Review } from "./types";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function productSlug(product: Pick<Product, "_id" | "name">) {
  return `${slugify(product.name)}-${product._id}`;
}

export function idFromSlug(slug: string) {
  return slug.split("-").pop() ?? slug;
}

export async function getProducts(params?: {
  category?: string;
  search?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.category && params.category !== "all")
    qs.set("category", params.category);
  if (params?.search) qs.set("search", params.search);
  const query = qs.toString() ? `?${qs.toString()}` : "";

  return apiFetch<Product[]>(`/products${query}`, {
    tags: [
      "products",
      ...(params?.category ? [`category:${params.category}`] : []),
    ],
  });
}

export async function getProduct(id: string) {
  return apiFetch<Product>(`/products/${id}`, { tags: [`product:${id}`] });
}

export async function getCategories() {
  return apiFetch<Category[]>("/categories", { tags: ["categories"] });
}

export async function getProductReviews(productId: string) {
  return apiFetch<Review[]>(`/reviews/product/${productId}`, {
    tags: [`reviews:${productId}`],
  });
}

import type { MetadataRoute } from "next";
import { getCategories, getProducts, productSlug } from "@/lib/products";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.memonclothstore.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    {
      url: `${SITE_URL}/privacy-policy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms-of-service`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/shipping-policy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/return-refund-policy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    const [categories, products] = await Promise.all([
      getCategories(),
      getProducts(),
    ]);

    const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
      url: `${SITE_URL}/category/${cat.id}`,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const productPages: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${SITE_URL}/product/${productSlug(product)}`,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    return [...staticPages, ...categoryPages, ...productPages];
  } catch {
    return staticPages;
  }
}

import { getCategories } from "@/lib/products";
import { HeaderNav } from "./site-header-nav";

export async function SiteHeader() {
  const categories = await getCategories().catch(() => []);

  return <HeaderNav categories={categories} />;
}

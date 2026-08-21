import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategories, getProducts } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { SearchBox } from "@/components/search-box";
import { SizeFilterSidebar } from "@/components/size-filter-sidebar";
import { getPromos, promosAt } from "@/lib/promos";
import { PromoSide } from "@/components/promo-ads";
import type { Product } from "@/lib/types";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ search?: string; sizes?: string }>;
}

// A product's own sizes take priority; if it has none but its color
// variants do, fall back to the union of sizes across all colors -
// same "does this product have sizes at all" logic used on the product page.
function availableSizes(product: Product): string[] {
  const fromTop = (product.sizes || [])
    .filter((s) => s.stock > 0)
    .map((s) => s.size);
  if (fromTop.length > 0) return fromTop;

  const fromColors = new Set<string>();
  (product.colors || []).forEach((c) =>
    (c.sizes || []).forEach((s) => {
      if (s.stock > 0) fromColors.add(s.size);
    }),
  );
  return Array.from(fromColors);
}

async function resolveCategory(
  slug: string,
  categories: Awaited<ReturnType<typeof getCategories>>,
) {
  if (slug === "all") return { id: "all", name: "All Products" };
  return categories.find((c) => c.id === slug) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories().catch(() => []);
  const category = await resolveCategory(slug, categories);
  if (!category) return {};

  return {
    title: category.name,
    description: `Shop ${category.name} at Memon Cloth Store - quality fabrics and clothing at affordable prices, Kalyan, Mumbai.`,
    alternates: { canonical: `/category/${slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { search, sizes } = await searchParams;
  const categories = await getCategories().catch(() => []);
  const category = await resolveCategory(slug, categories);
  if (!category) notFound();

  const products = await getProducts({ category: slug, search });
  const sideAds = promosAt(await getPromos(), "shop_side");

  const sizeCounts: Record<string, number> = {};
  products.forEach((p) => {
    const seen = new Set(availableSizes(p));
    seen.forEach((s) => {
      sizeCounts[s] = (sizeCounts[s] || 0) + 1;
    });
  });

  const selectedSizes = sizes ? sizes.split(",").filter(Boolean) : [];
  const filteredProducts =
    selectedSizes.length > 0
      ? products.filter((p) =>
          availableSizes(p).some((s) => selectedSizes.includes(s)),
        )
      : products;

  const hasSidebar = Object.keys(sizeCounts).length > 0 || sideAds.length > 0;

  return (
    <div>
      <div className="page-header">
        <h1>{category.name}</h1>
        <p>Browse our complete collection of quality clothing and fabrics</p>
        <div className="breadcrumb">
          <Link href="/">Home</Link> <span>/</span> <span>{category.name}</span>
        </div>
      </div>

      <section className="products-page">
        <div className="container">
          <div className="products-toolbar">
            <SearchBox initialValue={search} />
            <div className="cat-filters">
              <Link
                href="/category/all"
                className={`cat-btn${slug === "all" ? " active" : ""}`}
              >
                All
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/category/${cat.id}`}
                  className={`cat-btn${slug === cat.id ? " active" : ""}`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <div className={`shop-layout${hasSidebar ? " with-rail" : ""}`}>
            {hasSidebar && (
              <aside className="shop-sidebar">
                <SizeFilterSidebar counts={sizeCounts} selected={selectedSizes} />
                {sideAds.map((p) => (
                  <PromoSide key={p._id} promo={p} />
                ))}
              </aside>
            )}
            {filteredProducts.length === 0 ? (
              <div className="no-results">
                <i className="fas fa-box-open" />
                <p>No products found. Try a different search or category.</p>
              </div>
            ) : (
              <div className="products-grid">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
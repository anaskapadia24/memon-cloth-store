import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategories, getProducts } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { SearchBox } from "@/components/search-box";
import { getPromos, promosAt } from "@/lib/promos";
import { PromoSide } from "@/components/promo-ads";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ search?: string }>;
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
  const { search } = await searchParams;
  const categories = await getCategories().catch(() => []);
  const category = await resolveCategory(slug, categories);
  if (!category) notFound();

  const products = await getProducts({ category: slug, search });
  const sideAds = promosAt(await getPromos(), "shop_side");

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

          <div className={`shop-layout${sideAds.length ? " with-rail" : ""}`}>
            {sideAds.map((p) => (
              <PromoSide key={p._id} promo={p} />
            ))}
            {products.length === 0 ? (
              <div className="no-results">
                <i className="fas fa-box-open" />
                <p>No products found. Try a different search or category.</p>
              </div>
            ) : (
              <div className="products-grid">
                {products.map((product) => (
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

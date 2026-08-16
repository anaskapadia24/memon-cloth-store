import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getProduct, idFromSlug } from "@/lib/products";
import { ApiError } from "@/lib/api";
import { ProductPurchasePanel } from "@/components/product-purchase-panel";
import { ReviewsSection } from "@/components/reviews-section";
import { ProductVideos } from "@/components/product-videos";
import { RelatedProducts } from "@/components/related-products";
import { RecentlyViewed } from "@/components/recently-viewed";
import { getPromos, promosAt } from "@/lib/promos";
import { PromoBar } from "@/components/promo-ads";

interface Props {
  params: Promise<{ slug: string }>;
}

async function loadProduct(slug: string) {
  try {
    return await getProduct(idFromSlug(slug));
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.desc,
    alternates: { canonical: `/product/${slug}` },
    openGraph: { images: [product.img] },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) notFound();

  const images = product.images.length > 0 ? product.images : [product.img];
  const productAds = promosAt(await getPromos(), "product");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.desc,
    image: images,
    sku: product.sku || product._id,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability:
        product.stock > 0 ||
        product.sizes.some((s) => s.stock > 0) ||
        product.colors.some((c) => c.stock > 0)
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
    ...(product.numReviews > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.avgRating,
            reviewCount: product.numReviews,
          },
        }
      : {}),
  };

  return (
    <div>
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="product-breadcrumb-bar">
        <div className="container breadcrumb">
          <Link href="/">Home</Link> <span>/</span>{" "}
          <Link href={`/category/${product.cat}`}>{product.cat}</Link>{" "}
          <span>/</span> <span>{product.name}</span>
        </div>
      </div>

      <section className="product-details-page">
        <div className="container">
          {productAds.map((p) => (
            <PromoBar key={p._id} promo={p} />
          ))}
          <div className="product-details-grid">
            <ProductPurchasePanel product={product} images={images} />
          </div>

          {product.videos && product.videos.length > 0 && (
            <ProductVideos urls={product.videos} />
          )}

          <Suspense fallback={null}>
            <ReviewsSection productId={product._id} />
          </Suspense>

          <Suspense fallback={null}>
            <RelatedProducts product={product} />
          </Suspense>
          <RecentlyViewed product={product} />
        </div>
      </section>
    </div>
  );
}

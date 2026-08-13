import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getProduct, idFromSlug } from "@/lib/products";
import { ApiError } from "@/lib/api";
import { ProductGallery } from "@/components/product-gallery";
import { ProductOptions } from "@/components/product-options";
import { ReviewsSection } from "@/components/reviews-section";
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
            <ProductGallery images={images} name={product.name} />

            <div className="product-info-details">
              <div className="product-cat">{product.cat}</div>
              <h1>{product.name}</h1>

              {product.numReviews > 0 && (
                <div className="product-rating-row">
                  <span className="stars">
                    {"★".repeat(Math.round(product.avgRating))}
                  </span>
                  <span>
                    {product.avgRating.toFixed(1)} ({product.numReviews} review
                    {product.numReviews > 1 ? "s" : ""})
                  </span>
                </div>
              )}

              <div className="price-block-large">
                <span className="price-now-large">₹{product.price}</span>
                {product.originalPrice > product.price && (
                  <span className="price-was-large">
                    ₹{product.originalPrice}
                  </span>
                )}
              </div>
              {product.originalPrice > product.price && (
                <span className="discount-tag-large">
                  {Math.round(
                    ((product.originalPrice - product.price) /
                      product.originalPrice) *
                      100,
                  )}
                  % OFF · You save ₹{product.originalPrice - product.price}
                </span>
              )}

              <hr className="product-divider" />

              <p className="product-desc-full">{product.desc}</p>

              <ProductOptions product={product} />

              {(product.fabric ||
                product.work ||
                product.setInclude ||
                product.sku) && (
                <div className="product-features">
                  <hr className="product-divider" />
                  <h3>Product Details</h3>
                  <ul>
                    {product.fabric && (
                      <li>
                        <span className="spec-label">Fabric</span>
                        <span className="spec-value">{product.fabric}</span>
                      </li>
                    )}
                    {product.work && (
                      <li>
                        <span className="spec-label">Work</span>
                        <span className="spec-value">{product.work}</span>
                      </li>
                    )}
                    {product.setInclude && (
                      <li>
                        <span className="spec-label">Set Includes</span>
                        <span className="spec-value">{product.setInclude}</span>
                      </li>
                    )}
                    {product.sku && (
                      <li>
                        <span className="spec-label">SKU</span>
                        <span className="spec-value">{product.sku}</span>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <Suspense fallback={null}>
            <ReviewsSection productId={product._id} />
          </Suspense>
        </div>
      </section>
    </div>
  );
}

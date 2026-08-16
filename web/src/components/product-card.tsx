import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { productSlug } from "@/lib/products";
import { whatsappLink } from "@/lib/whatsapp";
import { CardAddToCartButton } from "./card-add-to-cart-button";

const CAT_LABELS: Record<string, string> = {
  "dress-material": "Dress Material",
  "kids-wear": "Kids Wear",
  fabrics: "Fabrics & Materials",
  "new-arrivals": "New Arrivals",
};

function catLabel(cat: string) {
  return CAT_LABELS[cat] || cat;
}

function colorEffectiveStock(c: Product["colors"][number]) {
  const sizeSum = (c.sizes || []).reduce((s, sz) => s + (sz.stock || 0), 0);
  return sizeSum > 0 ? sizeSum : c.stock || 0;
}

function isOutOfStock(p: Product) {
  if (p.colors && p.colors.length > 0) {
    return p.colors.reduce((sum, c) => sum + colorEffectiveStock(c), 0) === 0;
  }
  return p.stock === 0;
}

export function ProductCard({ product }: { product: Product }) {
  const comingSoon = !!product.comingSoon;
  const soldOut = !comingSoon && isOutOfStock(product);
  const blocked = comingSoon || soldOut;
  const hasDiscount = product.originalPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;

  const stockLabel = comingSoon ? (
    <div className="product-stock coming-soon">
      <i className="fas fa-clock" />{" "}
      {product.comingSoonNote ||
        (product.comingSoonKind === "restock" ? "Back soon" : "Coming soon")}
    </div>
  ) : product.stock === 0 ? (
    <div className="product-stock out-of-stock">
      <i className="fas fa-times-circle" /> Out of Stock
    </div>
  ) : product.stock <= 5 ? (
    <div className="product-stock low-stock">
      <i className="fas fa-exclamation-triangle" /> Only {product.stock} left
    </div>
  ) : (
    <div className="product-stock in-stock">
      <i className="fas fa-check-circle" /> In Stock ({product.stock})
    </div>
  );

  const waMessage = comingSoon
    ? `Hi Memon Cloth Store, please tell me when "${product.name}" is available.`
    : `Hi Memon Cloth Store, I'm interested in "${product.name}" (₹${product.price}). Please share more details.`;

  return (
    <div className="product-card reveal">
      <Link href={`/product/${productSlug(product)}`} className="product-img">
        <Image
          src={product.img}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
          className="product-img-primary"
        />
        {product.images[1] && (
          <Image
            src={product.images[1]}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
            className="product-img-secondary"
          />
        )}
        {product.badge && (
          <span className="product-badge">{product.badge}</span>
        )}
        {comingSoon && (
          <div className="sold-out-banner coming-soon-banner">
            {product.comingSoonKind === "restock" ? "Back soon" : "Coming Soon"}
          </div>
        )}
        {soldOut && <div className="sold-out-banner">Sold Out</div>}
      </Link>
      <div className="product-info">
        <div className="product-cat">{catLabel(product.cat)}</div>
        <Link href={`/product/${productSlug(product)}`}>
          <h3 className="product-name">{product.name}</h3>
        </Link>
        <p className="product-desc">{product.desc}</p>
        {stockLabel}
        <div className="product-bottom">
          <div>
            <div className="price-block">
              <span className="price-now">
                ₹{product.price}
                <span className="price-unit"> /piece</span>
              </span>
              {hasDiscount && (
                <span className="price-was">₹{product.originalPrice}</span>
              )}
            </div>
            {hasDiscount && (
              <span className="discount-tag">
                {discountPct}% OFF · Save ₹
                {product.originalPrice - product.price}
              </span>
            )}
          </div>
          <div className="product-actions">
            <CardAddToCartButton
              product={product}
              disabled={blocked}
              comingSoon={comingSoon}
            />
            <a
              href={whatsappLink(waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-inquire"
              aria-label="Inquire on WhatsApp"
            >
              <i className="fab fa-whatsapp" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

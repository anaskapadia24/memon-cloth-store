import Image from "next/image";
import Link from "next/link";
import { getProducts } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { HeroCarousel } from "@/components/hero-carousel";
import { whatsappLink } from "@/lib/whatsapp";
import { getPromos, getUpcomingPromos, promosAt } from "@/lib/promos";
import { PromoBar } from "@/components/promo-ads";

export default async function HomePage() {
  const products = await getProducts().catch(() => []);
  const promos = await getPromos();
  const upcomingPromos = await getUpcomingPromos();
  const ticker = promosAt(promos, "home_ticker");
  const featureIds = new Set(
    promos
      .filter((p) => p.kind === "featured")
      .flatMap((p) => p.productIds || []),
  );
  const featured = products
    .filter((p) => p.featured || featureIds.has(p._id) || p.badge)
    .slice(0, 8);
  // getProducts() already sorts newest-first (backend default), so this is
  // simply the first N, no separate "newest" query needed.
  const newArrivals = products.slice(0, 8);
  const restocking = products
    .filter((p) => p.comingSoon && p.comingSoonKind === "restock")
    .slice(0, 8);

  return (
    <div id="page-home">
      <section className="hero">
        <HeroCarousel />
        <div className="hero-overlay" />
        <div className="hero-pattern" />
        <div className="hero-decor" />

        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <i className="fas fa-star" /> Trusted Since Years in Kalyan
            </div>
            <h1>
              <span className="hero-title-main">MEMON CLOTH STORE</span>
              <span className="gold-line">
                Quality Fabrics at Affordable Prices
              </span>
            </h1>
            <p>
              From dresses to elegant fabrics, Memon Cloth Store brings you the
              finest clothing materials at prices that make sense. Visit our
              store in Kalyan, Mumbai.
            </p>
            <div className="hero-actions">
              <Link href="/category/all" className="btn btn-primary">
                <i className="fas fa-th-large" /> Browse Collection
              </Link>
              <a
                href={whatsappLink(
                  "Hi Memon Cloth Store, I would like to inquire about your products.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
              >
                <i className="fab fa-whatsapp" /> WhatsApp Inquiry
              </a>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-icon">
                  <i className="fas fa-heart" />
                </div>
                <div>
                  <h3>1000+</h3>
                  <p>Happy Customers</p>
                </div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-icon">
                  <i className="fas fa-vest-patches" />
                </div>
                <div>
                  <h3>500+</h3>
                  <p>Products</p>
                </div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-icon">
                  <i className="fas fa-award" />
                </div>
                <div>
                  <h3>25+</h3>
                  <p>Years of Trust</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {ticker.length > 0 ? (
        ticker.map((p) => <PromoBar key={p._id} promo={p} />)
      ) : (
        <div className="offers-banner">
          <div className="offers-track">
            {Array.from({ length: 2 }).map((_, i) => (
              <span key={i}>
                <i className="fas fa-fire" /> New Arrivals - Women&apos;s Summer
                Collection
                <i className="fas fa-percent" style={{ marginLeft: 60 }} /> Bulk
                Order Discounts Available
                <i className="fas fa-truck" style={{ marginLeft: 60 }} /> Free
                Home Delivery in Kalyan
                <i className="fas fa-gift" style={{ marginLeft: 60 }} /> Visit
                our Shop for better experience
              </span>
            ))}
          </div>
        </div>
      )}

      {upcomingPromos.length > 0 && (
        <section className="upcoming-sales">
          <div className="container">
            {upcomingPromos.map((p) => (
              <div className="upcoming-sale-card" key={p._id}>
                <i className="fas fa-bullhorn" />
                <div>
                  <strong>{p.title}</strong>
                  {p.blurb && <span> — {p.blurb}</span>}
                </div>
                {p.startsAt && (
                  <span className="upcoming-sale-date">
                    Starts{" "}
                    {new Date(p.startsAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="featured section-pad">
          <div className="container">
            <div className="reveal" style={{ textAlign: "center" }}>
              <span className="section-label">Our Collection</span>
              <h2 className="section-title">Featured Products</h2>
              <p className="section-subtitle" style={{ margin: "0 auto" }}>
                Handpicked selections from our latest arrivals and bestsellers
              </p>
            </div>
            <div className="products-grid">
              {featured.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            <div
              style={{ textAlign: "center", marginTop: 48 }}
              className="reveal"
            >
              <Link href="/category/all" className="btn btn-outline">
                View All Products <i className="fas fa-arrow-right" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {newArrivals.length > 0 && (
        <section className="featured section-pad" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="reveal" style={{ textAlign: "center" }}>
              <span className="section-label">Just In</span>
              <h2 className="section-title">New Arrivals</h2>
              <p className="section-subtitle" style={{ margin: "0 auto" }}>
                The latest additions to our collection
              </p>
            </div>
            <div className="products-grid">
              {newArrivals.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {restocking.length > 0 && (
        <section className="featured section-pad" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="reveal" style={{ textAlign: "center" }}>
              <span className="section-label">Worth the Wait</span>
              <h2 className="section-title">Coming Back Soon</h2>
              <p className="section-subtitle" style={{ margin: "0 auto" }}>
                Sold out favorites that are being restocked
              </p>
            </div>
            <div className="products-grid">
              {restocking.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="why-section section-pad">
        <div className="container">
          <div className="reveal" style={{ textAlign: "center" }}>
            <span className="section-label">Why Memon Cloth Store</span>
            <h2 className="section-title">The Trust Behind Every Thread</h2>
          </div>
          <div className="why-grid">
            <div className="why-card reveal">
              <div className="why-icon">
                <i className="fas fa-gem" />
              </div>
              <h3>Premium Quality Fabric</h3>
              <p>
                We source only the finest materials - from soft cottons to
                durable blends - ensuring every purchase feels luxurious and
                lasts long.
              </p>
            </div>
            <div className="why-card reveal">
              <div className="why-icon">
                <i className="fas fa-tags" />
              </div>
              <h3>Affordable Prices</h3>
              <p>
                Quality shouldn&apos;t break the bank. We offer competitive
                pricing with regular discounts, making premium clothing
                accessible to every family.
              </p>
            </div>
            <div className="why-card reveal">
              <div className="why-icon">
                <i className="fas fa-handshake" />
              </div>
              <h3>Trusted Local Store</h3>
              <p>
                Years of serving the Kalyan community with honesty and
                dedication. Our customers are our family, and their trust is our
                greatest asset.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="reveal" style={{ textAlign: "center" }}>
            <span className="section-label">Visit Us</span>
            <h2 className="section-title">Inside Our Store</h2>
          </div>
          <div className="gallery-grid" style={{ marginTop: 40 }}>
            {[
              { src: "/images/gallery/shop-1.jpg", alt: "Wall of folded printed fabrics on display at Memon Cloth Store" },
              { src: "/images/gallery/shop-3.jpg", alt: "Shop aisle with fabric shelving, seating, and mannequins near the entrance" },
              { src: "/images/gallery/shop-2.jpg", alt: "Seating area with glass tables and mannequins in front of the fabric wall" },
            ].map((img) => (
              <div className="gallery-item" key={img.src}>
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={800}
                  height={1000}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
          <div className="reveal" style={{ textAlign: "center", marginTop: 32 }}>
            <Link href="/gallery" className="btn btn-outline">
              View Full Gallery
            </Link>
          </div>
        </div>
      </section>

      <section className="testimonials section-pad">
        <div className="container">
          <div className="reveal" style={{ textAlign: "center" }}>
            <span className="section-label">Testimonials</span>
            <h2 className="section-title">What Our Customers Say</h2>
            <p className="section-subtitle" style={{ margin: "0 auto" }}>
              Real words from real customers who trust us
            </p>
          </div>
          <div className="test-grid">
            <div className="test-card reveal">
              <div className="test-stars">
                <i className="fas fa-star" />
                <i className="fas fa-star" />
                <i className="fas fa-star" />
                <i className="fas fa-star" />
                <i className="fas fa-star" />
              </div>
              <p className="test-text">
                &quot;Best cloth store in Kalyan! I&apos;ve been buying clothes
                from here for years. The quality is always top-notch and the
                prices are very reasonable.&quot;
              </p>
              <div className="test-author">
                <div className="test-avatar">FA</div>
                <div className="test-author-info">
                  <h4>Fatima Ansari</h4>
                  <p>Regular Customer</p>
                </div>
              </div>
            </div>
            <div className="test-card reveal">
              <div className="test-stars">
                <i className="fas fa-star" />
                <i className="fas fa-star" />
                <i className="fas fa-star" />
                <i className="fas fa-star" />
                <i className="fas fa-star" />
              </div>
              <p className="test-text">
                &quot;Amazing collection of fabrics! The staff is very helpful
                and they always suggest the best material for our needs. Highly
                recommended for anyone in Mumbai.&quot;
              </p>
              <div className="test-author">
                <div className="test-avatar">RK</div>
                <div className="test-author-info">
                  <h4>Anas Kapadia</h4>
                  <p>Loyal Customer</p>
                </div>
              </div>
            </div>
            <div className="test-card reveal">
              <div className="test-stars">
                <i className="fas fa-star" />
                <i className="fas fa-star" />
                <i className="fas fa-star" />
                <i className="fas fa-star" />
                <i className="fas fa-star-half-alt" />
              </div>
              <p className="test-text">
                &quot;I ordered kids wear through WhatsApp and the service was
                excellent. Quick response, great quality, and delivered right to
                my door. Will order again!&quot;
              </p>
              <div className="test-author">
                <div className="test-avatar">SP</div>
                <div className="test-author-info">
                  <h4>Ahmed Kapadia</h4>
                  <p>Online Customer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

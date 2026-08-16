import Link from "next/link";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata = {
  title: "About Us",
  description:
    "Memon Cloth Store has been serving Kalyan West, Mumbai since 1999 - quality fabrics at honest, fixed prices.",
};

export default function AboutPage() {
  return (
    <div>
      <div className="page-header">
        <h1>About Us</h1>
        <p>Trusted since years, right here in Kalyan</p>
        <div className="breadcrumb">
          <Link href="/">Home</Link> / About
        </div>
      </div>

      <section className="about-page">
        <div className="container">
          <div className="legal-content">
            <h3>Our Story</h3>
            <p>
              Memon Cloth Store has been serving Kalyan West, Mumbai
              since 1999. What started as a small shop has grown into a
              trusted destination for quality fabrics, dress materials,
              and readymade suits - all at fair, fixed prices, with no
              bargaining needed.
            </p>
            <p>
              Every roll of fabric on our shelves is chosen personally,
              and every customer who walks in - whether looking for
              everyday dress material or something special for a
              wedding or Eid - gets the same honest advice and
              attention.
            </p>

            <h3>What We Offer</h3>
            <ul>
              <li>* Dress materials in cotton, rayon, and embroidered fabrics</li>
              <li>* Hijabs and modest wear</li>
              <li>* Pakistani and Kashmiri readymade suits</li>
              <li>* Fixed pricing - no haggling, what you see is what you pay</li>
            </ul>

            <h3>Visit Our Store</h3>
            <p>
              We&apos;re located on Ghass Bazar Road, near National Urdu
              Primary School, Kalyan West, Mumbai - open all week. If you
              can&apos;t make it in person, browse our{" "}
              <Link href="/category/all">full collection online</Link> or{" "}
              
                <a href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
              >
                message us on WhatsApp
              </a>{" "}
              and we&apos;ll help you find what you&apos;re looking for.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
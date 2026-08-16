import Link from "next/link";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata = {
  title: "Terms of Service",
  description:
    "Terms and conditions for using the Memon Cloth Store website and placing orders.",
};

export default function TermsOfServicePage() {
  return (
    <div>
      <div className="page-header">
        <h1>Terms of Service</h1>
        <p>Last updated: 13 August 2026</p>
      </div>

      <section className="about-page">
        <div className="container">
          <div className="legal-content">
            <p>
              By using the Memon Cloth Store website and placing an order, you
              agree to the following terms.
            </p>

            <h3>Orders & Pricing</h3>
            <p>
              All product prices are listed in Indian Rupees (₹) and are subject
              to change without prior notice. We reserve the right to refuse or
              cancel any order, including in cases of pricing errors, stock
              unavailability, or suspected fraudulent activity.
            </p>

            <h3>Product Information</h3>
            <p>
              We make every effort to display product colors and details as
              accurately as possible. However, actual colors may vary slightly
              depending on your device&apos;s display settings.
            </p>

            <h3>Payments</h3>
            <p>
              We accept payments via Razorpay (cards, UPI, net banking) and Cash
              on Delivery, where available. Online payments are processed
              securely; we do not have access to or store your full payment
              details.
            </p>

            <h3>Returns & Refunds</h3>
            <p>
              Returns and refunds are governed by our{" "}
              <Link href="/return-refund-policy">
                Return &amp; Refund Policy
              </Link>
              .
            </p>

            <h3>Account Responsibility</h3>
            <p>
              You are responsible for maintaining the confidentiality of your
              account login details and for all activities under your account.
              You may delete your account at any time from your Account page -
              see our <Link href="/privacy-policy">Privacy Policy</Link> for
              what that does and doesn&apos;t remove.
            </p>

            <h3>Limitation of Liability</h3>
            <p>
              Memon Cloth Store is not liable for indirect, incidental, or
              consequential damages arising from the use of this website or its
              products, beyond the value of the order in question, except where
              such liability cannot be excluded under Indian law.
            </p>

            <h3>Governing Law</h3>
            <p>
              These terms are governed by the laws of India, and any disputes
              shall be subject to the jurisdiction of courts in Mumbai,
              Maharashtra.
            </p>

            <h3>Contact Us</h3>
            <p>
              For any questions about these terms, contact us on WhatsApp at{" "}
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
              >
                +91 84528 03023
              </a>
              .
            </p>

            <p style={{ marginTop: 40 }}>
              <Link href="/">&larr; Back to Home</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

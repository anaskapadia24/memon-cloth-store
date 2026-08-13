import Link from "next/link";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata = {
  title: "Shipping Policy",
  description:
    "Delivery charges, dispatch timelines, Cash on Delivery, and order tracking for Memon Cloth Store.",
};

export default function ShippingPolicyPage() {
  return (
    <div>
      <div className="page-header">
        <h1>Shipping Policy</h1>
        <p>How we get your order to you</p>
      </div>

      <section className="about-page">
        <div className="container">
          <div className="legal-content">
            <h3>Delivery Charges</h3>
            <p>
              We&apos;re currently offering{" "}
              <strong>free delivery on all orders</strong> for a limited
              introductory period. Standard delivery charges will apply after
              this period - any applicable charge will always be clearly shown
              at checkout before you place your order.
            </p>

            <h3>Dispatch & Delivery Timeline</h3>
            <p>
              Orders are usually <strong>dispatched within 48 hours</strong> of
              being placed.
            </p>
            <p>
              Standard delivery within India takes{" "}
              <strong>7 to 8 business days</strong> from the dispatch date,
              depending on your location. Please note that Saturdays, Sundays,
              and public holidays are not considered working days for delivery
              timelines. You&apos;ll receive updates on your order status
              (Packed, Shipped, Out for Delivery, Delivered) in the &quot;My
              Orders&quot; section of your account, along with an email
              confirmation when you place your order.
            </p>

            <h3>Cash on Delivery (COD)</h3>
            <p>
              Cash on Delivery is available for most locations. Please note a
              small additional charge may apply for COD orders - this will be
              shown at checkout before you confirm your order.
            </p>

            <h3>Order Tracking</h3>
            <p>
              You can track your order&apos;s progress anytime by logging in and
              visiting &quot;My Orders.&quot;
            </p>

            <h3>Delayed Orders</h3>
            <p>
              If your order hasn&apos;t been dispatched within the estimated
              timeframe, please reach out to us and our team will look into it
              right away.
            </p>

            <h3>Questions?</h3>
            <p>
              Contact us on WhatsApp at{" "}
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
              >
                +91 84528 03023
              </a>{" "}
              or call <a href="tel:+918452803023">+91 84528 03023</a> for any
              delivery-related questions.
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

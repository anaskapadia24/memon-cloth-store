import Link from "next/link";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata = {
  title: "Return & Refund Policy",
  description:
    "7-day replace or refund window, how to request a return, and how refunds are processed at Memon Cloth Store.",
};

export default function ReturnRefundPolicyPage() {
  return (
    <div>
      <div className="page-header">
        <h1>Return & Refund Policy</h1>
        <p>Our commitment to your satisfaction</p>
      </div>

      <section className="about-page">
        <div className="container">
          <div className="legal-content">
            <h2>7-Day Replace / Refund Window</h2>
            <p>
              We want you to be completely happy with your purchase. If
              something isn&apos;t right, you can request a{" "}
              <strong>replacement or refund within 7 days</strong> of your order
              being marked &quot;Delivered.&quot;
            </p>

            <h3>How to Request a Return</h3>
            <p>
              1. Go to <strong>My Orders</strong> on your account and find the
              delivered order.
            </p>
            <p>
              2. Click <strong>&quot;Request Replace / Refund&quot;</strong> and
              choose whether you&apos;d like a replacement or a refund, and tell
              us the reason.
            </p>
            <p>
              3. Our team will review your request and update you on its status
              (Approved, Rejected, or Completed) through the same order page.
            </p>

            <h3>Conditions for Return</h3>
            <ul>
              <li>
                Requests must be raised within 7 days of delivery - requests
                after this window cannot be accepted.
              </li>
              <li>
                Items must be unused, unwashed, and in their original condition,
                with all tags and packaging intact.
              </li>
              <li>
                Please keep the product ready for pickup/exchange once your
                request is approved.
              </li>
              <li>
                Items are inspected on receipt - approval of your request is
                confirmed once the returned product passes this check.
              </li>
            </ul>

            <h3>What Can&apos;t Be Returned</h3>
            <p>
              For hygiene and customization reasons, the following are not
              eligible for return or exchange unless the item arrived damaged,
              defective, or different from what you ordered:
            </p>
            <ul>
              <li>Innerwear, and any item marked as a hygiene product</li>
              <li>
                Fabric cut to order, or garments altered/stitched to your
                measurements
              </li>
              <li>Items purchased under a clearance or final-sale offer</li>
            </ul>

            <h3>Received a Damaged, Defective, or Wrong Item?</h3>
            <p>
              This is on us, not you - contact us within 48 hours of delivery
              with photos of the item and packaging. We&apos;ll prioritize a
              free replacement or full refund, no questions asked about
              condition or tags.
            </p>

            <h3>Refunds</h3>
            <p>
              Once a return is approved and the item is received back in good
              condition, refunds are processed to your original payment method
              within 5-7 business days. For Cash on Delivery orders, refunds are
              made via bank transfer or UPI - our team will contact you to
              arrange this.
            </p>

            <h3>Need Help?</h3>
            <p>
              Reach out to us on WhatsApp at{" "}
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
              >
                +91 84528 03023
              </a>{" "}
              or visit us at our Kalyan store, and we&apos;ll be happy to
              assist.
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

import Link from "next/link";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata = {
  title: "Privacy Policy",
  description:
    "How Memon Cloth Store collects, uses, and protects your personal information, including your rights under India's IT Rules 2021 and the DPDP Act.",
};

export default function PrivacyPolicyPage() {
  return (
    <div>
      <div className="page-header">
        <h1>Privacy Policy</h1>
        <p>Last updated: 13 August 2026</p>
      </div>

      <section className="about-page">
        <div className="container">
          <div className="legal-content">
            <p>
              Memon Cloth Store (&quot;we,&quot; &quot;us,&quot;
              &quot;our&quot;) respects your privacy. This policy explains what
              information we collect, how we use it, who we share it with, and
              the choices you have - including your rights under India&apos;s
              Information Technology Rules, 2021 and the Digital Personal Data
              Protection Act, 2023.
            </p>

            <h3>Information We Collect</h3>
            <p>
              When you create an account or place an order, we collect your
              name, email address, phone number, and delivery address. If you
              sign in with Google, we receive your name and email from Google.
              Payment details are processed securely by Razorpay - we do not
              store your card, UPI, or bank information.
            </p>

            <h3>How We Use Your Information</h3>
            <ul>
              <li>To process and deliver your orders</li>
              <li>
                To send order confirmations and delivery updates via email or
                WhatsApp
              </li>
              <li>To respond to your inquiries and provide customer support</li>
              <li>To improve our products and services</li>
            </ul>

            <h3>Who We Share Information With</h3>
            <p>
              We do not sell or rent your personal information to third parties.
              We share information only as needed to run the store:
            </p>
            <ul>
              <li>
                <strong>Razorpay</strong> - processes your payment (card/UPI/net
                banking details go directly to Razorpay, not to us).
              </li>
              <li>
                <strong>Shiprocket</strong> - receives your name, delivery
                address, and phone number to ship and track your order.
              </li>
              <li>
                <strong>Cloudinary</strong> - hosts our product photos only; no
                customer personal data is sent here.
              </li>
              <li>
                <strong>Google</strong> - if you use &quot;Sign in with
                Google,&quot; Google shares your name and email with us to
                create/log in to your account.
              </li>
            </ul>

            <h3>Data Retention & Account Deletion</h3>
            <p>
              You can review and update your account information anytime from
              your Account page, and you can delete your account yourself from
              Account &rarr; Danger Zone. Deleting your account removes your
              personal information (name, email, phone, addresses) from our
              active systems.
            </p>
            <p>
              Under Indian tax law, we&apos;re required to retain order and
              invoice records for a set number of years regardless of account
              status. Deleting your account does not delete your past order
              history - it remains attached to the order record as it stood at
              the time of purchase, independent of your account, solely for
              accounting, tax, and legal compliance.
            </p>

            <h3>Your Rights</h3>
            <p>
              You have the right to access, correct, or request deletion of your
              personal data, subject to our legal retention obligations
              described above. To exercise these rights or raise any privacy
              concern, contact our Grievance Officer below.
            </p>

            <h3>Grievance Officer</h3>
            <div className="legal-callout">
              <p style={{ margin: "0 0 8px" }}>
                <strong>Anas Kapadia</strong>
                <br />
                Memon Cloth Store
                <br />
                Email:{" "}
                <a href="mailto:memonclothstore1978@gmail.com">
                  memonclothstore1978@gmail.com
                </a>
                <br />
                Phone/WhatsApp:{" "}
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  +91 84528 03023
                </a>
              </p>
              <p style={{ margin: 0 }}>
                In accordance with the Information Technology Rules, 2021, we
                will acknowledge your complaint within 24 hours and resolve it
                within 15 days.
              </p>
            </div>

            <h3>Contact Us</h3>
            <p>
              For any other privacy-related questions, reach us on WhatsApp at{" "}
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
              >
                +91 84528 03023
              </a>{" "}
              or visit our store in Kalyan, Mumbai.
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

import Image from "next/image";
import Link from "next/link";
import { getCategories } from "@/lib/products";
import { whatsappLink } from "@/lib/whatsapp";

export async function SiteFooter() {
  const categories = await getCategories().catch(() => []);

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="nav-brand">
              <Image
                src="/Memon_logo.png"
                alt="Memon Cloth Store"
                width={64}
                height={64}
                style={{ height: 64, width: 64 }}
              />
            </div>
            <p>
              Your trusted clothing store in Kalyan, Mumbai. Offering premium
              quality fabrics, women&apos;s wear, and kids wear at affordable
              prices.
            </p>
            <div className="footer-social">
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <i className="fab fa-whatsapp" />
              </a>
              <a
                href="https://www.instagram.com/memon_cloth_store"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <i className="fab fa-instagram" />
              </a>
              <a href="#" aria-label="Facebook">
                <i className="fab fa-facebook-f" />
              </a>
            </div>
          </div>

          <div>
            <h4>Quick Links</h4>
            <ul>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/category/all">Shop</Link>
              </li>
              <li>
                <Link href="/cart">Shopping Cart</Link>
              </li>
              <li>
                <Link href="/account/orders">My Orders</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4>Policies</h4>
            <ul>
              <li>
                <Link href="/return-refund-policy">
                  Return &amp; Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy">Shipping Policy</Link>
              </li>
              <li>
                <Link href="/track">Track order</Link>
              </li>
              <li>
                <Link href="/privacy-policy">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms-of-service">Terms of Service</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4>Categories</h4>
            <ul>
              {categories.map((cat) => (
                <li key={cat._id}>
                  <Link href={`/category/${cat.id}`}>{cat.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Contact Info</h4>
            <div className="footer-contact-item">
              <i className="fas fa-map-marker-alt" />
              <a
                href="https://www.google.com/maps/place/Memon+Cloth+Store+%26+Memon+NX/@19.2409492,73.1214226,17z/data=!4m6!3m5!1s0x3be795d98b84df17:0x9c7a66822ac22775!8m2!3d19.2409!4d73.121454!16s%2Fg%2F12612cy3h"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ghass Bazar Road, Near National Urdu Primary School, Kalyan
                West, Mumbai
              </a>
            </div>
            <div className="footer-contact-item">
              <i className="fas fa-phone-alt" />
              <a href="tel:+918452803023">+91 84528 03023</a>
            </div>
            <div className="footer-contact-item">
              <i className="fab fa-whatsapp" />
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
              >
                +91 84528 03023
              </a>
            </div>
            <div className="footer-contact-item">
              <i className="fas fa-clock" />
              <p>Mon - Sun: 11:00 AM - 9:00 PM</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} Memon Cloth Store. All rights
            reserved.
          </p>
          <p>Crafted with care in Mumbai, India</p>
        </div>
      </div>
    </footer>
  );
}

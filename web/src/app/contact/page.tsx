import Link from "next/link";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Memon Cloth Store - visit us in Kalyan West, Mumbai, call, or message us on WhatsApp.",
};

export default function ContactPage() {
  return (
    <div>
      <div className="page-header">
        <h1>Contact Us</h1>
        <p>We&apos;d love to hear from you</p>
        <div className="breadcrumb">
          <Link href="/">Home</Link> / Contact
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-card">
              <i className="fas fa-map-marker-alt" />
              <h4>Visit Us</h4>
              
                <a href="https://www.google.com/maps/place/Memon+Cloth+Store+%26+Memon+NX/@19.2409492,73.1214226,17z/data=!4m6!3m5!1s0x3be795d98b84df17:0x9c7a66822ac22775!8m2!3d19.2409!4d73.121454!16s%2Fg%2F12612cy3h"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ghass Bazar Road, Near National Urdu Primary School, Kalyan
                West, Mumbai
              </a>
            </div>

            <div className="contact-card">
              <i className="fas fa-phone-alt" />
              <h4>Call Us</h4>
              <a href="tel:+918452803023">+91 84528 03023</a>
            </div>

            <div className="contact-card">
              <i className="fab fa-whatsapp" />
              <h4>WhatsApp</h4>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                +91 9987462312
              </a>
            </div>

            <div className="contact-card">
              <i className="fas fa-clock" />
              <h4>Store Hours</h4>
              <p>Mon - Sun: 11:00 AM - 9:30 PM</p>
            </div>
          </div>

          <div className="contact-actions">
            
             <a href={whatsappLink("Hi, I have a question about your products.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
            >
              <i className="fab fa-whatsapp" /> Message Us on WhatsApp
            </a>
            <a href="tel:+919987462312" className="btn btn-outline">
              <i className="fas fa-phone-alt" /> Call the Store
            </a>
          </div>

          <div className="contact-map">
            <iframe
              title="Memon Cloth Store location"
              src="https://www.google.com/maps?q=Memon+Cloth+Store,+Ghass+Bazar+Road,+Kalyan+West,+Mumbai&output=embed"
              width="100%"
              height="380"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
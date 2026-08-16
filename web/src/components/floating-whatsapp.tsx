import { whatsappLink } from "@/lib/whatsapp";

export function FloatingWhatsApp() {
  return (
    <a
      href={whatsappLink(
        "Hi Memon Cloth Store, I would like to inquire about your products.",
      )}
      target="_blank"
      rel="noopener noreferrer"
      className="float-whatsapp"
      aria-label="Chat on WhatsApp"
    >
      <i className="fab fa-whatsapp" />
    </a>
  );
}

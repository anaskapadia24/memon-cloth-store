const DEFAULT_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918452803023";

export function whatsappLink(message = "", phone = DEFAULT_NUMBER) {
  const base = `https://wa.me/${phone}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

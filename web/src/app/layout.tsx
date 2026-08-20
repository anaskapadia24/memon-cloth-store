import type { Metadata } from "next";
import Script from "next/script";
import { Newsreader, Sora } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FloatingWhatsApp } from "@/components/floating-whatsapp";
import { ScrollReveal } from "@/components/scroll-reveal";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import { getCurrentUser } from "@/lib/session";
import { getPromos, promosAt } from "@/lib/promos";
import { PromoBar, PromoPopup } from "@/components/promo-ads";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  axes: ["opsz"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.memonclothstore.com",
  ),
  title: {
    default:
      "MEMON CLOTH STORE | Quality Fabrics at Affordable Prices - Mumbai",
    template: "%s | Memon Cloth Store",
  },
  description:
    "Memon Cloth Store - Premium clothing, women's wear, kids wear & fabrics in Kalyan. Quality fabrics at affordable prices. Visit us at Ghass Bazar Road, Kalyan.",
  keywords: [
    "Memon Cloth Store",
    "clothing store Kalyan",
    "women's wear",
    "kids wear",
    "fabrics",
    "affordable clothing Kalyan",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Memon Cloth Store",
    locale: "en_IN",
    images: [
      {
        url: "/images/hero/hero1.png",
        width: 1200,
        height: 630,
        alt: "Memon Cloth Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Memon Cloth Store | Quality Fabrics at Affordable Prices - Mumbai",
    description:
      "Premium clothing, women's wear, kids wear & fabrics in Kalyan. Quality fabrics at affordable prices.",
    images: ["/images/hero/hero1.png"],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const promos = await getPromos();
  const topAds = promosAt(promos, "home_top");
  const popAds = promosAt(promos, "popup");

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${newsreader.variable} ${sora.variable}`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
        {/* Applies a saved theme choice before first paint, so there's no light-flash for dark-mode users */}
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('memon_theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}`,
          }}
        />
      </head>
            <body>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-6CZ1XC8KQX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-6CZ1XC8KQX');
          `}
        </Script>
        <AuthProvider user={user}>
          <CartProvider>
            <ScrollReveal />
            {topAds.map((p) => (
              <PromoBar key={p._id} promo={p} compact />
            ))}
            <SiteHeader />
            <PromoPopup promos={popAds} />
            {children}
            <SiteFooter />
            <FloatingWhatsApp />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

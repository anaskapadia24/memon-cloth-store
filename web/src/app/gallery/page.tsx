import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Gallery",
  description:
    "A look inside Memon Cloth Store in Kalyan, Mumbai — our fabric wall, seating area, and collection on display.",
};

const GALLERY_IMAGES = [
  { src: "/images/gallery/shop-1.jpg", alt: "Wall of folded printed fabrics on display at Memon Cloth Store" },
  { src: "/images/gallery/shop-3.jpg", alt: "Shop aisle with fabric shelving, seating, and mannequins near the entrance" },
  { src: "/images/gallery/shop-2.jpg", alt: "Seating area with glass tables and mannequins in front of the fabric wall" },
  { src: "/images/gallery/shop-5.png", alt: "Fabric shelves running the length of the billing counter" },
  { src: "/images/gallery/shop-4.jpg", alt: "Billing counter with the shop's Fixed Rate and exchange policy signage" },
];

export default function GalleryPage() {
  return (
    <div>
      <div className="page-header">
        <h1>Our Gallery</h1>
        <p>A glimpse into our store and collection</p>
        <div className="breadcrumb">
          <Link href="/">Home</Link> / Gallery
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="gallery-grid">
            {GALLERY_IMAGES.map((img) => (
              <div className="gallery-item" key={img.src}>
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={800}
                  height={1000}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
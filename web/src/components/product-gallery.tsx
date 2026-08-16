"use client";

import { useState } from "react";
import Image from "next/image";

export function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const shown = images.length > 0 ? images : ["/placeholder.svg"];

  return (
    <div className="product-gallery">
      <div className="product-main-image">
        <Image
          src={shown[active]}
          alt={name}
          fill
          sizes="(max-width: 900px) 100vw, 50vw"
          priority
          style={{ objectFit: "cover" }}
        />
      </div>
      {shown.length > 1 && (
        <div className="product-thumbnails">
          {shown.map((src, i) => (
            <button
              key={src + i}
              className={`product-thumb${i === active ? " active" : ""}`}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === active}
              style={{ position: "relative" }}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="72px"
                style={{ objectFit: "cover" }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "./product-card";
import type { Product } from "@/lib/types";

const KEY = "memon_recently_viewed";
const MAX = 8;

function readStored(): Product[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Product[]) : [];
  } catch {
    return [];
  }
}

export function RecentlyViewed({ product }: { product: Product }) {
  const [others, setOthers] = useState<Product[]>([]);

  useEffect(() => {
    const stored = readStored();
    const deduped = [product, ...stored.filter((p) => p._id !== product._id)];
    localStorage.setItem(KEY, JSON.stringify(deduped.slice(0, MAX)));
    setOthers(deduped.slice(1, MAX));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product._id]);

  if (!others.length) return null;

  return (
    <section className="related-products">
      <h2 className="section-title" style={{ fontSize: "1.4rem" }}>
        Recently Viewed
      </h2>
      <div className="products-grid">
        {others.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </section>
  );
}

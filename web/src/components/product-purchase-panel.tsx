"use client";

import { useState } from "react";
import { ProductGallery } from "./product-gallery";
import { ProductOptions } from "./product-options";
import type { Product } from "@/lib/types";

export function ProductPurchasePanel({
  product,
  images,
}: {
  product: Product;
  images: string[];
}) {
  const [color, setColor] = useState(product.colors[0]?.name ?? "");
  const activeColor = product.colors.find((c) => c.name === color);
  const galleryImages = activeColor?.images.length
    ? activeColor.images
    : images;
  const price = activeColor?.price || product.price;
  const originalPrice = activeColor?.price ? 0 : product.originalPrice;

  return (
    <>
      <ProductGallery images={galleryImages} name={product.name} />

      <div className="product-info-details">
        <div className="product-cat">{product.cat}</div>
        <h1>{product.name}</h1>

        {product.numReviews > 0 && (
          <div className="product-rating-row">
            <span className="stars">
              {"★".repeat(Math.round(product.avgRating))}
            </span>
            <span>
              {product.avgRating.toFixed(1)} ({product.numReviews} review
              {product.numReviews > 1 ? "s" : ""})
            </span>
          </div>
        )}

        <div className="price-block-large">
          <span className="price-now-large">₹{price}</span>
          {originalPrice > price && (
            <span className="price-was-large">₹{originalPrice}</span>
          )}
        </div>
        {originalPrice > price && (
          <span className="discount-tag-large">
            {Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF ·
            You save ₹{originalPrice - price}
          </span>
        )}

        <hr className="product-divider" />

        <p className="product-desc-full">{product.desc}</p>

        <ProductOptions
          product={product}
          color={color}
          onColorChange={setColor}
        />

        {(product.fabric ||
          product.work ||
          product.setInclude ||
          product.sku) && (
          <div className="product-features">
            <hr className="product-divider" />
            <h3>Product Details</h3>
            <ul>
              {product.fabric && (
                <li>
                  <span className="spec-label">Fabric</span>
                  <span className="spec-value">{product.fabric}</span>
                </li>
              )}
              {product.work && (
                <li>
                  <span className="spec-label">Work</span>
                  <span className="spec-value">{product.work}</span>
                </li>
              )}
              {product.setInclude && (
                <li>
                  <span className="spec-label">Set Includes</span>
                  <span className="spec-value">{product.setInclude}</span>
                </li>
              )}
              {product.sku && (
                <li>
                  <span className="spec-label">SKU</span>
                  <span className="spec-value">{product.sku}</span>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}

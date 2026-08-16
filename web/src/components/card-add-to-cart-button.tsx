"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/types";

export function CardAddToCartButton({
  product,
  disabled,
  comingSoon,
}: {
  product: Product;
  disabled?: boolean;
  comingSoon?: boolean;
}) {
  const { items, addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const inCart = items.some((i) => i.id === product._id && !i.size && !i.color);
  const added = inCart || justAdded;

  function handleClick() {
    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      qty: 1,
      img: product.img,
    });
    setJustAdded(true);
  }

  return (
    <button
      className={`btn-add-cart${added ? " added" : ""}`}
      onClick={handleClick}
      disabled={disabled}
    >
      <i
        className={`fas fa-${comingSoon ? "clock" : added ? "check" : "shopping-bag"}`}
      />{" "}
      {comingSoon
        ? "Soon"
        : disabled
          ? "Out of Stock"
          : added
            ? "Added"
            : "Add"}
    </button>
  );
}

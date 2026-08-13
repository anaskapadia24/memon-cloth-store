"use client";

import { useEffect, useState } from "react";
import type { Promo } from "@/lib/types";

export function PromoBar({
  promo,
  compact,
}: {
  promo: Promo;
  compact?: boolean;
}) {
  return (
    <div className={`sale-bar${compact ? " compact" : ""}`}>
      <strong>{promo.title}</strong>
      {promo.blurb ? <span>{promo.blurb}</span> : null}
      {promo.coupon ? <em>Code {promo.coupon}</em> : null}
    </div>
  );
}

export function PromoSide({ promo }: { promo: Promo }) {
  return (
    <aside className="sale-side">
      <div className="sale-side-inner">
        <small>On now</small>
        <h3>{promo.title}</h3>
        {promo.blurb ? <p>{promo.blurb}</p> : null}
        {promo.coupon ? (
          <div className="sale-code">Use {promo.coupon}</div>
        ) : null}
      </div>
    </aside>
  );
}

export function PromoPopup({ promos }: { promos: Promo[] }) {
  const promo = promos[0];
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!promo) return;
    const key = `memon_pop_${promo._id}`;
    if (sessionStorage.getItem(key)) return;
    const t = window.setTimeout(() => setOpen(true), 800);
    return () => window.clearTimeout(t);
  }, [promo]);

  if (!promo || !open) return null;

  return (
    <div className="sale-pop-bg" onClick={() => dismiss(promo._id, setOpen)}>
      <div className="sale-pop" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="sale-pop-x"
          onClick={() => dismiss(promo._id, setOpen)}
          aria-label="Close"
        >
          ×
        </button>
        <small>Special offer</small>
        <h3>{promo.title}</h3>
        {promo.blurb ? <p>{promo.blurb}</p> : null}
        {promo.coupon ? (
          <div className="sale-code">Use code {promo.coupon} at checkout</div>
        ) : null}
        <a
          href="/category/all"
          className="btn btn-primary"
          onClick={() => dismiss(promo._id, setOpen)}
        >
          Shop now
        </a>
      </div>
    </div>
  );
}

function dismiss(id: string, setOpen: (v: boolean) => void) {
  sessionStorage.setItem(`memon_pop_${id}`, "1");
  setOpen(false);
}

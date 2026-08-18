// "use client";

// import { useMemo, useState } from "react";
// import { useCart } from "@/lib/cart-context";
// import { useAuth } from "@/lib/auth-context";
// import { whatsappLink } from "@/lib/whatsapp";
// import { notifyMeAction } from "@/lib/actions/notify";
// import { ProductShareButton } from "./product-share-button";
// import type { Product, ProductColor } from "@/lib/types";

// function stockDotClass(stock: number) {
//   if (stock === 0) return "no-stock";
//   if (stock <= 5) return "low-stock";
//   return "in-stock";
// }

// function colorEffectiveStock(c: ProductColor) {
//   const sizeSum = (c.sizes || []).reduce((s, sz) => s + (sz.stock || 0), 0);
//   return sizeSum > 0 ? sizeSum : c.stock || 0;
// }

// export function ProductOptions({
//   product,
//   color,
//   onColorChange,
// }: {
//   product: Product;
//   color: string;
//   onColorChange: (name: string) => void;
// }) {
//   const { addItem } = useCart();
//   const { user } = useAuth();
//   const [size, setSize] = useState("");
//   const [added, setAdded] = useState(false);
//   const [notifyEmail, setNotifyEmail] = useState(user?.email || "");
//   const [notifyState, setNotifyState] = useState<
//     "idle" | "sending" | "sent" | "error"
//   >("idle");

//   const activeColor = product.colors.find((c) => c.name === color);
//   const sizeOptions = activeColor ? activeColor.sizes : product.sizes;
//   const price = activeColor?.price || product.price;

//   const productOutOfStock =
//     product.colors.length > 0
//       ? product.colors.reduce((sum, c) => sum + colorEffectiveStock(c), 0) === 0
//       : product.stock === 0;

//   async function handleNotify(e: React.FormEvent) {
//     e.preventDefault();
//     if (!notifyEmail.trim()) return;
//     setNotifyState("sending");
//     const res = await notifyMeAction(product._id, notifyEmail.trim());
//     setNotifyState(res.ok ? "sent" : "error");
//   }

//   const stock = useMemo(() => {
//     if (sizeOptions.length > 0)
//       return sizeOptions.find((s) => s.size === size)?.stock ?? 0;
//     if (activeColor) return activeColor.stock;
//     return product.stock;
//   }, [sizeOptions, size, activeColor, product.stock]);

//   const comingSoon = !!product.comingSoon;
//   const needsSize = sizeOptions.length > 0 && !size;
//   const canAdd = !comingSoon && !needsSize && stock > 0;

//   function handleAdd() {
//     if (!canAdd) return;
//     addItem({
//       id: product._id,
//       name: product.name,
//       price,
//       qty: 1,
//       img: activeColor?.images[0] || product.img,
//       size: size || undefined,
//       color: color || undefined,
//     });
//     setAdded(true);
//     setTimeout(() => setAdded(false), 1500);
//   }

//   const waMessage = comingSoon
//     ? `Hi Memon Cloth Store, please tell me when "${product.name}" is available.`
//     : `Hi Memon Cloth Store, I'm interested in "${product.name}" (₹${price}). Please share more details.`;

//   return (
//     <div>
//       {product.colors.length > 0 && (
//         <div className="color-selector">
//           <h4
//             style={{
//               fontSize: "0.9rem",
//               fontWeight: 600,
//               color: "var(--ink)",
//               marginBottom: 12,
//             }}
//           >
//             Color: <span style={{ fontWeight: 400 }}>{color}</span>
//           </h4>
//           <div className="color-options">
//             {product.colors.map((c) => (
//               <button
//                 key={c.name}
//                 className={`color-btn${c.name === color ? " selected" : ""}`}
//                 onClick={() => {
//                   onColorChange(c.name);
//                   setSize("");
//                 }}
//               >
//                 {c.name}
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       {sizeOptions.length > 0 && (
//         <div className="size-selector">
//           <h4>
//             Size {size && <span style={{ fontWeight: 400 }}>: {size}</span>}
//           </h4>
//           <div className="size-options">
//             {sizeOptions.map((s) => (
//               <button
//                 key={s.size}
//                 className={`size-btn${s.size === size ? " selected" : ""}${s.stock === 0 ? " out-of-stock" : ""}`}
//                 disabled={s.stock === 0}
//                 onClick={() => setSize(s.size)}
//               >
//                 {s.size}
//                 <span className={`stock-dot ${stockDotClass(s.stock)}`} />
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       {sizeOptions.length === 0 && (
//         <div className="product-stock-large">
//           <span
//             className={`stock-status ${comingSoon ? "coming-soon" : stock === 0 ? "out-of-stock" : stock <= 5 ? "low-stock" : "in-stock"}`}
//           >
//             <i
//               className={`fas fa-${comingSoon ? "clock" : stock === 0 ? "times-circle" : stock <= 5 ? "exclamation-triangle" : "check-circle"}`}
//             />
//             {comingSoon
//               ? product.comingSoonNote ||
//                 (product.comingSoonKind === "restock"
//                   ? "Back soon"
//                   : "Coming soon")
//               : stock === 0
//                 ? "Out of Stock"
//                 : stock <= 5
//                   ? `Only ${stock} left`
//                   : `In Stock (${stock})`}
//           </span>
//         </div>
//       )}

//       <div className="product-actions-large">
//         <button className="btn btn-navy" onClick={handleAdd} disabled={!canAdd}>
//           <i className={`fas fa-${added ? "check" : "shopping-bag"}`} />
//           {comingSoon
//             ? "Coming Soon"
//             : needsSize
//               ? "Select a Size"
//               : stock === 0
//                 ? "Sold Out"
//                 : added
//                   ? "Added to Cart"
//                   : "Add to Cart"}
//         </button>
//         <a
//           href={whatsappLink(waMessage)}
//           target="_blank"
//           rel="noopener noreferrer"
//           className="btn btn-whatsapp"
//         >
//           <i className="fab fa-whatsapp" /> Inquire
//         </a>
//         <ProductShareButton productName={product.name} price={price} />
//       </div>

//       {!comingSoon && productOutOfStock && (
//         <div className="notify-me-box">
//           {notifyState === "sent" ? (
//             <p>
//               <i className="fas fa-check-circle" /> We&apos;ll email you when
//               it&apos;s back in stock.
//             </p>
//           ) : (
//             <form onSubmit={handleNotify}>
//               <label htmlFor="notify-email">
//                 Notify me when this is back in stock
//               </label>
//               <div className="notify-me-row">
//                 <input
//                   id="notify-email"
//                   type="email"
//                   required
//                   value={notifyEmail}
//                   onChange={(e) => setNotifyEmail(e.target.value)}
//                   placeholder="you@example.com"
//                 />
//                 <button
//                   type="submit"
//                   className="btn btn-outline"
//                   disabled={notifyState === "sending"}
//                 >
//                   {notifyState === "sending" ? "Saving..." : "Notify Me"}
//                 </button>
//               </div>
//               {notifyState === "error" && (
//                 <p className="notify-me-error">
//                   Something went wrong - please try again.
//                 </p>
//               )}
//             </form>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }



"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { whatsappLink } from "@/lib/whatsapp";
import { notifyMeAction } from "@/lib/actions/notify";
import { ProductShareButton } from "./product-share-button";
import type { Product, ProductColor } from "@/lib/types";

function stockDotClass(stock: number) {
  if (stock === 0) return "no-stock";
  if (stock <= 5) return "low-stock";
  return "in-stock";
}

function colorEffectiveStock(c: ProductColor) {
  const sizeSum = (c.sizes || []).reduce((s, sz) => s + (sz.stock || 0), 0);
  return sizeSum > 0 ? sizeSum : c.stock || 0;
}

export function ProductOptions({
  product,
  color,
  onColorChange,
}: {
  product: Product;
  color: string;
  onColorChange: (name: string) => void;
}) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [size, setSize] = useState("");
  const [added, setAdded] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState(user?.email || "");
  const [notifyState, setNotifyState] = useState<
    "idle" | "sending" | "sent" | "error" 
  >("idle");

  const activeColor = product.colors.find((c) => c.name === color);
  const sizeOptions = activeColor ? activeColor.sizes : product.sizes;
  const price = activeColor?.price || product.price;

  const productOutOfStock =
    product.colors.length > 0
      ? product.colors.reduce((sum, c) => sum + colorEffectiveStock(c), 0) === 0
      : product.stock === 0;

  async function handleNotify(e: React.FormEvent) {
    e.preventDefault();
    if (!notifyEmail.trim()) return;
    setNotifyState("sending");
    const res = await notifyMeAction(product._id, notifyEmail.trim());
    setNotifyState(res.ok ? "sent" : "error");
  }

  const stock = useMemo(() => {
    if (sizeOptions.length > 0)
      return sizeOptions.find((s) => s.size === size)?.stock ?? 0;
    if (activeColor) return activeColor.stock;
    return product.stock;
  }, [sizeOptions, size, activeColor, product.stock]);

  const comingSoon = !!product.comingSoon;
  const needsSize = sizeOptions.length > 0 && !size;
  const canAdd = !comingSoon && !needsSize && stock > 0;

  function handleAdd() {
    if (!canAdd) return;
    addItem({
      id: product._id,
      name: product.name,
      price,
      qty: 1,
      img: activeColor?.images[0] || product.img,
      size: size || undefined,
      color: color || undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  function handleBuyNow() {
    if (!canAdd || buyingNow) return;
    setBuyingNow(true);
    addItem({
      id: product._id,
      name: product.name,
      price,
      qty: 1,
      img: activeColor?.images[0] || product.img,
      size: size || undefined,
      color: color || undefined,
    });
    router.push("/checkout");
  }

  const waMessage = comingSoon
    ? `Hi Memon Cloth Store, please tell me when "${product.name}" is available.`
    : `Hi Memon Cloth Store, I'm interested in "${product.name}" (₹${price}). Please share more details.`;

  return (
    <div>
      {product.colors.length > 0 && (
        <div className="color-selector">
          <h4
            style={{
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "var(--ink)",
              marginBottom: 12,
            }}
          >
            Color: <span style={{ fontWeight: 400 }}>{color}</span>
          </h4>
          <div className="color-options">
            {product.colors.map((c) => (
              <button
                key={c.name}
                className={`color-btn${c.name === color ? " selected" : ""}`}
                onClick={() => {
                  onColorChange(c.name);
                  setSize("");
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {sizeOptions.length > 0 && (
        <div className="size-selector">
          <h4>
            Size {size && <span style={{ fontWeight: 400 }}>: {size}</span>}
          </h4>
          <div className="size-options">
            {sizeOptions.map((s) => (
              <button
                key={s.size}
                className={`size-btn${s.size === size ? " selected" : ""}${s.stock === 0 ? " out-of-stock" : ""}`}
                disabled={s.stock === 0}
                onClick={() => setSize(s.size)}
              >
                {s.size}
                <span className={`stock-dot ${stockDotClass(s.stock)}`} />
              </button>
            ))}
          </div>
        </div>
      )}

      {sizeOptions.length === 0 && (
        <div className="product-stock-large">
          <span
            className={`stock-status ${comingSoon ? "coming-soon" : stock === 0 ? "out-of-stock" : stock <= 5 ? "low-stock" : "in-stock"}`}
          >
            <i
              className={`fas fa-${comingSoon ? "clock" : stock === 0 ? "times-circle" : stock <= 5 ? "exclamation-triangle" : "check-circle"}`}
            />
            {comingSoon
              ? product.comingSoonNote ||
                (product.comingSoonKind === "restock"
                  ? "Back soon"
                  : "Coming soon")
              : stock === 0
                ? "Out of Stock"
                : stock <= 5
                  ? `Only ${stock} left`
                  : `In Stock (${stock})`}
          </span>
        </div>
      )}

      <div className="product-actions-large">
        <button className="btn btn-navy" onClick={handleAdd} disabled={!canAdd}>
          <i className={`fas fa-${added ? "check" : "shopping-bag"}`} />
          {comingSoon
            ? "Coming Soon"
            : needsSize
              ? "Select a Size"
              : stock === 0
                ? "Sold Out"
                : added
                  ? "Added to Cart"
                  : "Add to Cart"}
        </button>
        {!comingSoon && (
          <button
            className="btn btn-primary"
            onClick={handleBuyNow}
            disabled={!canAdd || buyingNow}
          >
            <i className="fas fa-bolt" />
            {needsSize
              ? "Select a Size"
              : stock === 0
                ? "Sold Out"
                : buyingNow
                  ? "Redirecting..."
                  : "Buy Now"}
          </button>
        )}
        
         <a href={whatsappLink(waMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-whatsapp"
        >
          <i className="fab fa-whatsapp" /> Inquire
        </a>
        <ProductShareButton productName={product.name} price={price} />
      </div>

      {!comingSoon && productOutOfStock && (
        <div className="notify-me-box">
          {notifyState === "sent" ? (
            <p>
              <i className="fas fa-check-circle" /> We&apos;ll email you when
              it&apos;s back in stock.
            </p>
          ) : (
            <form onSubmit={handleNotify}>
              <label htmlFor="notify-email">
                Notify me when this is back in stock
              </label>
              <div className="notify-me-row">
                <input
                  id="notify-email"
                  type="email"
                  required
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  placeholder="you@example.com"
                />
                <button
                  type="submit"
                  className="btn btn-outline"
                  disabled={notifyState === "sending"}
                >
                  {notifyState === "sending" ? "Saving..." : "Notify Me"}
                </button>
              </div>
              {notifyState === "error" && (
                <p className="notify-me-error">
                  Something went wrong - please try again.
                </p>
              )}
            </form>
          )}
        </div>
      )}
    </div>
  );
}
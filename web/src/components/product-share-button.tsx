"use client";

import { useEffect, useRef, useState } from "react";
import { whatsappLink } from "@/lib/whatsapp";

export function ProductShareButton({
  productName,
  price,
}: {
  productName: string;
  price: number;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function getUrl() {
    return typeof window !== "undefined" ? window.location.href : "";
  }

  function getMessage() {
    return `Check out "${productName}" (₹${price}) at Memon Cloth Store: ${getUrl()}`;
  }

  async function handleShareClick() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: `Check out "${productName}" at Memon Cloth Store`,
          url: getUrl(),
        });
      } catch {
        // user cancelled the native share sheet - do nothing
      }
      return;
    }
    setOpen((v) => !v);
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(getUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API unavailable - silently ignore
    }
  }

  return (
    <div className="share-menu" ref={menuRef}>
      <button
        type="button"
        className="share-btn"
        onClick={handleShareClick}
        aria-label="Share this product"
      >
        <i className="fas fa-share-alt" />
      </button>

      <div className={`share-dropdown${open ? " open" : ""}`}>
        
        <a href={whatsappLink(getMessage())}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setOpen(false)}
        >
          <i className="fab fa-whatsapp" /> WhatsApp
        </a>
        
        <a href={`mailto:?subject=${encodeURIComponent(
            `Check out ${productName}`,
          )}&body=${encodeURIComponent(getMessage())}`}
          onClick={() => setOpen(false)}
        >
          <i className="fas fa-envelope" /> Email
        </a>
        <button type="button" onClick={handleCopyLink}>
          <i className={`fas fa-${copied ? "check" : "link"}`} />{" "}
          {copied ? "Link Copied" : "Copy Link"}
        </button>
      </div>
    </div>
  );
}
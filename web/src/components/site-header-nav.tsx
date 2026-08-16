"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle, ThemeToggleRow } from "./theme-toggle";
import type { Category } from "@/lib/types";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/category/all", label: "Shop" },
  { href: "/gallery", label: "Gallery" },
];

const MORE_LINKS = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function HeaderNav({ categories }: { categories: Category[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { count } = useCart();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (!userMenuRef.current?.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setDropdownOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  return (
    <>
      <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
        <div className="nav-inner">
          <Link href="/" className="nav-brand">
            <Image
              src="/Memon_logo.png"
              alt="Memon Cloth Store"
              width={48}
              height={48}
              style={{ height: 48, width: 48 }}
              priority
            />
          </Link>

          <div className="nav-links">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={pathname === link.href ? "active" : ""}
              >
                {link.label}
              </Link>
            ))}
            <div className="nav-dropdown">
              <button className="nav-dropdown-trigger" type="button">
                Category
                <i
                  className="fas fa-chevron-down"
                  style={{ fontSize: "0.65rem", marginLeft: 6 }}
                />
              </button>
              <div className="nav-dropdown-menu">
                <div className="nav-dropdown-menu-inner">
                  {categories.map((cat) => (
                    <Link key={cat._id} href={`/category/${cat.id}`}>
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            {MORE_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={pathname === link.href ? "active" : ""}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="nav-cta">
            <a href="tel:+918452803023" className="btn-call">
              <i className="fas fa-phone" /> Call Us
            </a>

            {user ? (
              <div className="user-menu" ref={userMenuRef}>
                <button
                  className="user-btn"
                  onClick={() => setDropdownOpen((v) => !v)}
                >
                  <div className="user-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{user.name.split(" ")[0]}</span>
                  <i
                    className="fas fa-chevron-down"
                    style={{ fontSize: "0.7rem" }}
                  />
                </button>
                <div className={`user-dropdown${dropdownOpen ? " open" : ""}`}>
                  <div className="user-dropdown-header">
                    <h4>{user.name}</h4>
                    <p>{user.email}</p>
                  </div>
                  <Link href="/account" onClick={() => setDropdownOpen(false)}>
                    <i className="fas fa-user" /> My Profile
                  </Link>
                  <Link
                    href="/account/orders"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <i className="fas fa-box" /> My Orders
                  </Link>
                  <button className="logout-btn" onClick={logout}>
                    <i className="fas fa-sign-out-alt" /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/login" className="user-btn">
                <i className="fas fa-user" /> Login
              </Link>
            )}

            <ThemeToggle />

            <Link
              href="/cart"
              className="cart-icon-btn"
              aria-label={`Cart, ${count} items`}
            >
              <i className="fas fa-shopping-bag" />
              <span className={`cart-badge${count === 0 ? " empty" : ""}`}>
                {count}
              </span>
            </Link>

            <button
              className={`hamburger${menuOpen ? " active" : ""}`}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>

      <button
        className={`mobile-menu-backdrop${menuOpen ? " open" : ""}`}
        aria-hidden="true"
        tabIndex={-1}
        onClick={() => setMenuOpen(false)}
      />
      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        {user && (
          <div className="mobile-menu-identity">
            <div className="user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4>{user.name}</h4>
              <p>{user.email}</p>
            </div>
          </div>
        )}

        <span className="mobile-menu-label">Menu</span>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={pathname === link.href ? "active" : ""}
          >
            {link.label}
          </Link>
        ))}
        <span className="mobile-menu-label">Categories</span>
        {categories.map((cat) => (
          <Link key={cat._id} href={`/category/${cat.id}`}>
            {cat.name}
          </Link>
        ))}
        {MORE_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={pathname === link.href ? "active" : ""}
          >
            {link.label}
          </Link>
        ))}
        <Link href="/cart">
          <i className="fas fa-shopping-bag" /> Cart ({count})
        </Link>

        <span className="mobile-menu-label">Account</span>
        {user ? (
          <>
            <Link href="/account">
              <i className="fas fa-user" /> My Profile
            </Link>
            <Link href="/account/orders">
              <i className="fas fa-box" /> My Orders
            </Link>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                logout();
              }}
            >
              <i className="fas fa-sign-out-alt" /> Logout
            </a>
          </>
        ) : (
          <Link href="/login">
            <i className="fas fa-user" /> Login / Register
          </Link>
        )}
        <ThemeToggleRow />
      </div>
    </>
  );
}

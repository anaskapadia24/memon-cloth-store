"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle, ThemeToggleRow } from "./theme-toggle";
import type { Category } from "@/lib/types";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/category/all", label: "Shop" },
];

export function HeaderNav({ categories }: { categories: Category[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { count } = useCart();
  const { user, logout } = useAuth();
  const pathname = usePathname();

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
            {categories.slice(0, 4).map((cat) => (
              <Link
                key={cat._id}
                href={`/category/${cat.id}`}
                className={pathname === `/category/${cat.id}` ? "active" : ""}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="nav-cta">
            <a href="tel:+918452803023" className="btn-call">
              <i className="fas fa-phone" /> Call Us
            </a>

            {user ? (
              <div className="user-menu">
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
              className="hamburger"
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

      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={pathname === link.href ? "active" : ""}
          >
            {link.label}
          </Link>
        ))}
        {categories.map((cat) => (
          <Link key={cat._id} href={`/category/${cat.id}`}>
            {cat.name}
          </Link>
        ))}
        <ThemeToggleRow />
        <Link href="/cart">
          <i className="fas fa-shopping-bag" /> Cart ({count})
        </Link>
        {user ? (
          <>
            <Link href="/account">My Account</Link>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                logout();
              }}
            >
              Logout
            </a>
          </>
        ) : (
          <Link href="/login">Login / Register</Link>
        )}
      </div>
    </>
  );
}

import { useEffect, useState } from "react";
import {
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import { ThemeToggle } from "./components/ThemeToggle.tsx";
import { ToastHost } from "./components/ToastHost.tsx";
import { useAuth } from "./lib/auth.tsx";
import { STORE_URL } from "./lib/api.ts";
import { Categories } from "./pages/Categories.tsx";
import { Customers } from "./pages/Customers.tsx";
import { Dashboard } from "./pages/Dashboard.tsx";
import { Login } from "./pages/Login.tsx";
import { NotFound } from "./pages/NotFound.tsx";
import { Orders } from "./pages/Orders.tsx";
import { Products } from "./pages/Products.tsx";
import { Reviews } from "./pages/Reviews.tsx";
import { Promos } from "./pages/Promos.tsx";
import { SettingsPage } from "./pages/Settings.tsx";
import { Shipments } from "./pages/Shipments.tsx";
import { Campaigns } from "./pages/Campaigns.tsx";

const TABS = [
  { to: "/", end: true, icon: "fa-chart-line", label: "Dashboard" },
  { to: "/products", icon: "fa-box", label: "Products" },
  { to: "/orders", icon: "fa-shopping-cart", label: "Orders" },
  { to: "/shipments", icon: "fa-truck", label: "Shipments" },
  { to: "/promos", icon: "fa-bullhorn", label: "Offers" },
  { to: "/campaigns", icon: "fa-envelope", label: "Emails" },
  { to: "/customers", icon: "fa-users", label: "Customers" },
  { to: "/reviews", icon: "fa-star", label: "Reviews" },
  { to: "/categories", icon: "fa-tags", label: "Categories" },
  { to: "/settings", icon: "fa-cog", label: "Settings" },
];

function useSelectNumberOnFocus() {
  useEffect(() => {
    function onFocusIn(e: FocusEvent) {
      const el = e.target as HTMLElement;
      if (el instanceof HTMLInputElement && el.type === "number") {
        el.select();
      }
    }
    document.addEventListener("focusin", onFocusIn);
    return () => document.removeEventListener("focusin", onFocusIn);
  }, []);
}

function ScrollTop({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    onNavigate?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
  return null;
}

function Shell() {
  const { user, ready, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  if (!ready) return <div className="boot-screen">Checking session…</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="admin-panel">
      <ScrollTop onNavigate={() => setSidebarOpen(false)} />
      <div className="admin-topbar">
        <div className="admin-topbar-inner">
          <button
            className={`hamburger${sidebarOpen ? " active" : ""}`}
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
          <div className="brand">
            <img src="/Memon_logo.png" alt="Logo" />
            <div className="brand-text">
              <span>MEMON CLOTH STORE</span>
              <small>Admin · {user.name}</small>
            </div>
          </div>
          <div className="topbar-actions">
            <ThemeToggle />
            <a
              href={STORE_URL}
              className="back-link"
              target="_blank"
              rel="noreferrer"
            >
              <i className="fas fa-external-link-alt" /> Store
            </a>
            <button
              className="btn btn-sm btn-outline topbar-logout"
              onClick={() => {
                signOut();
                window.location.href = "/login";
              }}
            >
              <i className="fas fa-sign-out-alt" /> Logout
            </button>
          </div>
        </div>
      </div>

      <button
        className={`admin-sidebar-backdrop${sidebarOpen ? " open" : ""}`}
        aria-hidden="true"
        tabIndex={-1}
        onClick={() => setSidebarOpen(false)}
      />
      <div className="admin-body">
        <aside className={`admin-sidebar${sidebarOpen ? " open" : ""}`}>
          <nav className="sidebar-nav">
            {TABS.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.end}
                className={({ isActive }) =>
                  `tab-btn${isActive ? " active" : ""}`
                }
              >
                <i className={`fas ${t.icon}`} /> {t.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className="admin-main">
          <div className="container">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </div>
      </div>
      <ToastHost />
    </div>
  );
}

export default function App() {
  useSelectNumberOnFocus();
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Shell />}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="orders" element={<Orders />} />
        <Route path="shipments" element={<Shipments />} />
        <Route path="promos" element={<Promos />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="customers" element={<Customers />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="categories" element={<Categories />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

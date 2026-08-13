import { useEffect } from "react";
import {
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { ThemeToggle } from "./components/ThemeToggle.tsx";
import { ToastHost } from "./components/ToastHost.tsx";
import { useAuth } from "./lib/auth.tsx";
import { STORE_URL } from "./lib/api.ts";
import { Categories } from "./pages/Categories.tsx";
import { Customers } from "./pages/Customers.tsx";
import { Dashboard } from "./pages/Dashboard.tsx";
import { Login } from "./pages/Login.tsx";
import { Orders } from "./pages/Orders.tsx";
import { Products } from "./pages/Products.tsx";
import { Reviews } from "./pages/Reviews.tsx";
import { Promos } from "./pages/Promos.tsx";
import { SettingsPage } from "./pages/Settings.tsx";
import { Shipments } from "./pages/Shipments.tsx";

const TABS = [
  { to: "/", end: true, icon: "fa-chart-line", label: "Dashboard" },
  { to: "/products", icon: "fa-box", label: "Products" },
  { to: "/orders", icon: "fa-shopping-cart", label: "Orders" },
  { to: "/shipments", icon: "fa-truck", label: "Shipments" },
  { to: "/promos", icon: "fa-bullhorn", label: "Offers" },
  { to: "/customers", icon: "fa-users", label: "Customers" },
  { to: "/reviews", icon: "fa-star", label: "Reviews" },
  { to: "/categories", icon: "fa-tags", label: "Categories" },
  { to: "/settings", icon: "fa-cog", label: "Settings" },
];

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
}

function Shell() {
  const { user, ready, signOut } = useAuth();
  if (!ready) return <div className="boot-screen">Checking session…</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="admin-panel">
      <ScrollTop />
      <div className="admin-topbar">
        <div className="admin-topbar-inner">
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
      <div className="admin-tabs">
        <div className="tabs-inner">
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
        </div>
      </div>
      <div className="container">
        <Outlet />
      </div>
      <ToastHost />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Shell />}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="orders" element={<Orders />} />
        <Route path="shipments" element={<Shipments />} />
        <Route path="promos" element={<Promos />} />
        <Route path="customers" element={<Customers />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="categories" element={<Categories />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

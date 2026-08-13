import { Link } from "react-router-dom";
import {
  api,
  orderId,
  useAsync,
  type Order,
  type Product,
  type Review,
  type Stats,
} from "../lib/api.ts";

const WEEK = 7 * 24 * 60 * 60 * 1000;
const PLACEHOLDER = "images.unsplash.com";

export function Dashboard() {
  const statsQ = useAsync(() => api<Stats>("/admin/stats"), []);
  const productsQ = useAsync(() => api<Product[]>("/products"), []);
  const ordersQ = useAsync(() => api<Order[]>("/orders"), []);
  const reviewsQ = useAsync(
    () => api<Review[]>("/reviews").catch(() => [] as Review[]),
    [],
  );

  const stats = statsQ.data;
  const products = productsQ.data || [];
  const orders = ordersQ.data || [];
  const reviews = reviewsQ.data || [];
  const bootError = statsQ.error || productsQ.error || ordersQ.error;
  const paid = orders.filter((o) => o.status !== "cancelled");
  const now = Date.now();
  const thisWeek = paid.filter((o) => t(o) > now - WEEK);
  const lastWeek = paid.filter((o) => {
    const x = t(o);
    return x <= now - WEEK && x > now - 2 * WEEK;
  });
  const rev = (list: Order[]) => list.reduce((s, o) => s + o.total, 0);
  const revThis = rev(thisWeek);
  const revLast = rev(lastWeek);
  const revDelta = revLast
    ? ((revThis - revLast) / revLast) * 100
    : revThis
      ? 100
      : 0;
  const aov = paid.length ? Math.round(rev(paid) / paid.length) : 0;
  const pending = orders.filter((o) => o.status === "pending");
  const cancelled = orders.filter((o) => o.status === "cancelled");
  const returns = orders.filter(
    (o) => o.returnRequest?.requested && o.returnRequest.status === "requested",
  );
  const out = products.filter((p) => p.stock === 0);
  const low = products.filter((p) => p.stock > 0 && p.stock <= 5);
  const noSku = products.filter((p) => !p.sku);
  const badImg = products.filter((p) => !p.img || p.img.includes(PLACEHOLDER));
  const inStock = products.filter((p) => p.stock > 5);
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length
    : 0;

  const sold: Record<string, { name: string; qty: number; rupees: number }> =
    {};
  for (const o of paid) {
    for (const i of o.items) {
      const key = i.name;
      sold[key] = sold[key] || { name: i.name, qty: 0, rupees: 0 };
      sold[key].qty += i.qty;
      sold[key].rupees += i.price * i.qty;
    }
  }
  const top = Object.values(sold)
    .sort((a, b) => b.rupees - a.rupees)
    .slice(0, 5);

  const bad: Flag[] = [];
  if (out.length)
    bad.push({
      tone: "bad",
      title: `${out.length} sold out`,
      detail: names(out),
      to: "/products?stock=out",
    });
  if (low.length)
    bad.push({
      tone: "warn",
      title: `${low.length} low stock`,
      detail: names(low, true),
      to: "/products?stock=low",
    });
  if (pending.length)
    bad.push({
      tone: "warn",
      title: `${pending.length} orders waiting`,
      detail: "Need packing or a status update",
      to: "/orders",
    });
  if (returns.length)
    bad.push({
      tone: "bad",
      title: `${returns.length} return requests`,
      detail: "Customer waiting on a decision",
      to: "/orders",
    });
  if (noSku.length)
    bad.push({
      tone: "warn",
      title: `${noSku.length} products have no SKU`,
      detail: "Harder to find at the counter",
      to: "/products?flag=nosku",
    });
  if (badImg.length)
    bad.push({
      tone: "warn",
      title: `${badImg.length} weak product photos`,
      detail: "Missing image or leftover placeholder",
      to: "/products?flag=photo",
    });

  const good: Flag[] = [];
  if (revThis > 0)
    good.push({
      tone: "good",
      title: `₹${revThis.toLocaleString()} this week`,
      detail:
        revDelta >= 0
          ? `${fmtDelta(revDelta)} vs last week`
          : `${fmtDelta(revDelta)} vs last week`,
    });
  if (inStock.length)
    good.push({
      tone: "good",
      title: `${inStock.length} products healthy stock`,
      detail: "More than 5 units on hand",
    });
  if (avgRating >= 4)
    good.push({
      tone: "good",
      title: `${avgRating.toFixed(1)}★ average rating`,
      detail: `${reviews.length} reviews`,
    });
  if (cancelled.length === 0 && orders.length)
    good.push({
      tone: "good",
      title: "No cancelled orders",
      detail: "Fulfillment is holding",
    });

  const recent = orders.slice(0, 6);

  return (
    <div className="tab-content">
      <div className="admin-header">
        <div>
          <h2>Dashboard</h2>
          <p>
            {statsQ.loading || productsQ.loading || ordersQ.loading
              ? "Loading store numbers…"
              : "What needs you today — money, stock, and orders"}
          </p>
        </div>
      </div>

      {bootError ? (
        <p className="health-empty" style={{ marginBottom: 16 }}>
          {bootError}
        </p>
      ) : null}
      <div className="kpi-grid">
        <Kpi
          label="Revenue"
          value={stats ? `₹${(stats.totalRevenue || 0).toLocaleString()}` : "—"}
          hint={`${paid.length} paid orders`}
        />
        <Kpi
          label="This week"
          value={`₹${revThis.toLocaleString()}`}
          hint={fmtDelta(revDelta) + " vs last week"}
          delta={revDelta}
        />
        <Kpi
          label="Avg order"
          value={`₹${aov.toLocaleString()}`}
          hint="Paid orders only"
        />
        <Kpi
          label="Pending"
          value={pending.length}
          hint="Need action"
          alert={pending.length > 0}
        />
        <Kpi
          label="In catalog"
          value={stats?.totalProducts ?? products.length}
          hint={`${out.length} sold out`}
        />
        <Kpi
          label="Customers"
          value={stats?.totalCustomers ?? "—"}
          hint={`${reviews.length} reviews`}
        />
      </div>

      <div className="dash-split">
        <section className="admin-section">
          <h3>Needs attention</h3>
          {bad.length === 0 ? (
            <p className="health-empty">
              Nothing urgent. Catalog and orders look clean.
            </p>
          ) : (
            bad.map((f) => <FlagRow key={f.title} flag={f} />)
          )}
        </section>
        <section className="admin-section">
          <h3>Going well</h3>
          {good.length === 0 ? (
            <p className="health-empty">
              Not enough signal yet — once orders land, wins show up here.
            </p>
          ) : (
            good.map((f) => <FlagRow key={f.title} flag={f} />)
          )}
        </section>
      </div>

      <div className="dash-split">
        <section className="admin-section">
          <h3>Top sellers</h3>
          {top.length === 0 ? (
            <div className="empty-state">
              <p>No paid orders yet</p>
            </div>
          ) : (
            <ol className="rank-list">
              {top.map((p, i) => (
                <li key={p.name}>
                  <span className="rank-n">{i + 1}</span>
                  <span className="rank-name">{p.name}</span>
                  <span className="rank-meta">
                    {p.qty} sold · ₹{p.rupees.toLocaleString()}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
        <section className="admin-section">
          <h3>Recent orders</h3>
          {recent.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-inbox" />
              <p>No orders yet</p>
            </div>
          ) : (
            recent.map((o) => (
              <Link to="/orders" className="mini-order" key={o._id}>
                <div>
                  <strong>#{orderId(o)}</strong>
                  <span>{o.customer?.name || "Customer"}</span>
                </div>
                <div className="mini-order-right">
                  <span className={`order-status ${o.status}`}>{o.status}</span>
                  <b>₹{o.total}</b>
                </div>
              </Link>
            ))
          )}
        </section>
      </div>
    </div>
  );
}

type Flag = {
  tone: "good" | "bad" | "warn";
  title: string;
  detail: string;
  to?: string;
};

function FlagRow({ flag }: { flag: Flag }) {
  const inner = (
    <>
      <span className={`dot ${flag.tone}`} />
      <div>
        <strong>{flag.title}</strong>
        <p>{flag.detail}</p>
      </div>
    </>
  );
  return flag.to ? (
    <Link className={`flag-row ${flag.tone}`} to={flag.to}>
      {inner}
    </Link>
  ) : (
    <div className={`flag-row ${flag.tone}`}>{inner}</div>
  );
}

function Kpi({
  label,
  value,
  hint,
  delta,
  alert,
}: {
  label: string;
  value: string | number;
  hint: string;
  delta?: number;
  alert?: boolean;
}) {
  return (
    <div className={`kpi${alert ? " alert" : ""}`}>
      <h4>{label}</h4>
      <div className="val">{value}</div>
      <p>
        {delta !== undefined ? (
          <span className={delta >= 0 ? "up" : "down"}>{fmtDelta(delta)}</span>
        ) : null}{" "}
        {hint}
      </p>
    </div>
  );
}

function t(o: Order) {
  return new Date(o.createdAt || o.date || 0).getTime();
}

function fmtDelta(n: number) {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(0)}%`;
}

function names(list: Product[], withStock = false) {
  const shown = list
    .slice(0, 4)
    .map((p) => (withStock ? `${p.name} (${p.stock})` : p.name));
  return (
    shown.join(", ") + (list.length > 4 ? ` +${list.length - 4} more` : "")
  );
}

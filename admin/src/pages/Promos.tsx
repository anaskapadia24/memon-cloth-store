import { useMemo, useState } from "react";
import { api, useAsync, type Product } from "../lib/api.ts";
import { toast } from "../lib/toast.ts";
import { NumberInput } from "../components/NumberInput.tsx";

export type Promo = {
  _id?: string;
  title: string;
  blurb: string;
  kind: "percent" | "bogo" | "flat" | "featured" | "banner" | "custom";
  percent: number;
  flatOff: number;
  customRule: string;
  minAmount: number;
  buyQty: number;
  payQty: number;
  coupon: string;
  usageLimit: number;
  perUserLimit: number;
  timesUsed?: number;
  placements: string[];
  productIds: string[];
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
};

const EMPTY: Promo = {
  title: "",
  blurb: "",
  kind: "percent",
  percent: 10,
  flatOff: 0,
  customRule: "",
  minAmount: 2000,
  buyQty: 3,
  payQty: 2,
  coupon: "",
  usageLimit: 0,
  perUserLimit: 1,
  placements: ["home_ticker"],
  productIds: [],
  active: false,
  startsAt: null,
  endsAt: null,
};

const KINDS = [
  {
    id: "percent",
    icon: "fa-percent",
    title: "Percent off",
    hint: "e.g. 10% off when cart is over Rs 2000",
  },
  {
    id: "flat",
    icon: "fa-rupee-sign",
    title: "Rupees off",
    hint: "e.g. Rs 200 off over Rs 1500",
  },
  {
    id: "bogo",
    icon: "fa-tags",
    title: "Buy more, pay less",
    hint: "e.g. buy 3, pay for 2",
  },
  {
    id: "featured",
    icon: "fa-star",
    title: "Highlight products",
    hint: "Push chosen items to the homepage",
  },
  {
    id: "banner",
    icon: "fa-bullhorn",
    title: "Just a message",
    hint: "No price change, only an announcement",
  },
  {
    id: "custom",
    icon: "fa-pen",
    title: "Custom offer",
    hint: "Write your own rule in plain words",
  },
] as const;

const PLACES = [
  { id: "home_top", title: "Above the menu", hint: "Thin bar at the very top" },
  {
    id: "home_ticker",
    title: "Under the menu",
    hint: "Scrolling strip on the homepage",
  },
  {
    id: "shop_side",
    title: "Shop side",
    hint: "Left column on the shop page (that empty space)",
  },
  { id: "product", title: "Product page", hint: "Banner above the product" },
  { id: "checkout", title: "Checkout", hint: "Next to pay, with coupon box" },
  {
    id: "popup",
    title: "Popup",
    hint: "A box that appears when they open the site",
  },
] as const;

export function Promos() {
  const { data: list, reload } = useAsync(
    () => api<Promo[]>("/promos/all"),
    [],
  );
  const { data: products } = useAsync(() => api<Product[]>("/products"), []);
  const [draft, setDraft] = useState<Promo>({ ...EMPTY });
  const [previewAt, setPreviewAt] = useState("home_ticker");
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const headline = useMemo(() => labelFor(draft), [draft]);

  function edit(p: Promo) {
    setDraft({
      ...EMPTY,
      ...p,
      coupon: p.coupon || "",
      placements: p.placements || [],
      productIds: (p.productIds || []).map(String),
    });
    setPreviewAt(p.placements?.[0] || "home_ticker");
    setShowForm(true);
  }

  function startNew() {
    setDraft({ ...EMPTY });
    setPreviewAt("home_ticker");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setDraft({ ...EMPTY });
  }

  function togglePlace(id: string) {
    setDraft((d) => {
      const has = d.placements.includes(id);
      const placements = has
        ? d.placements.filter((x) => x !== id)
        : [...d.placements, id];
      return { ...d, placements };
    });
    setPreviewAt(id);
  }

  async function save(publish: boolean) {
    if (!draft.title.trim()) {
      toast("Give this offer a name first", "error");
      return;
    }
    if (publish && draft.placements.length === 0) {
      toast("Pick at least one place to show it", "error");
      return;
    }
    setSaving(true);
    try {
      const body = { ...draft, active: publish };
      if (draft._id)
        await api(`/promos/${draft._id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
      else {
        const created = await api<Promo>("/promos", {
          method: "POST",
          body: JSON.stringify(body),
        });
        setDraft((d) => ({ ...d, _id: created._id }));
      }
      toast(
        publish
          ? "Customers can see this now"
          : "Saved as draft. Not live yet.",
      );
      await reload();
      setShowForm(false);
    } catch (e) {
      toast((e as Error).message || "Could not save", "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Remove this offer? Customers will stop seeing it.")) return;
    await api(`/promos/${id}`, { method: "DELETE" });
    if (draft._id === id) setDraft({ ...EMPTY });
    setShowForm(false);
    toast("Offer removed");
    await reload();
  }

  async function turn(p: Promo, on: boolean) {
    await api(`/promos/${p._id}`, {
      method: "PUT",
      body: JSON.stringify({ ...p, active: on }),
    });
    toast(on ? "This offer is live" : "This offer is hidden");
    await reload();
  }

  return (
    <div className="tab-content">
      <div className="admin-header">
        <div>
          <h2>Sales and offers</h2>
          <p>
            {showForm
              ? "See how it looks first. Then press Show to customers."
              : "All offers. Open one to edit, or add a new offer."}
          </p>
        </div>
        {showForm ? (
          <button className="btn btn-outline" onClick={closeForm}>
            Back to list
          </button>
        ) : (
          <button className="btn btn-primary" onClick={startNew}>
            <i className="fas fa-plus" /> New offer
          </button>
        )}
      </div>

      {!showForm && <ScheduleOverview list={list || []} />}

      {!showForm && (
        <section className="admin-section">
          {!(list || []).length ? (
            <p className="health-empty">
              No offers yet. Press New offer to make one.
            </p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Offer</th>
                  <th>Type</th>
                  <th>Uses</th>
                  <th>Live?</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {(list || []).map((p) => (
                  <tr key={p._id}>
                    <td>
                      <strong>{p.title}</strong>
                      <small
                        style={{ display: "block", color: "var(--gray-500)" }}
                      >
                        {p.coupon
                          ? `Code ${p.coupon}`
                          : p.blurb || p.customRule}
                      </small>
                    </td>
                    <td>
                      {KINDS.find((k) => k.id === p.kind)?.title || p.kind}
                    </td>
                    <td>
                      {p.coupon ? (
                        <span style={{ fontSize: ".82rem" }}>
                          {p.timesUsed || 0}
                          {p.usageLimit ? ` / ${p.usageLimit}` : ""}
                          {p.perUserLimit === 1 ? (
                            <small
                              style={{
                                display: "block",
                                color: "var(--gray-500)",
                              }}
                            >
                              one-time per customer
                            </small>
                          ) : null}
                        </span>
                      ) : (
                        <span style={{ color: "var(--gray-300)" }}>-</span>
                      )}
                    </td>
                    <td>
                      <span className={`pill ${p.active ? "ok" : "warn"}`}>
                        {p.active ? "Live" : "Draft"}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => edit(p)}
                      >
                        Edit / preview
                      </button>
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => void turn(p, !p.active)}
                      >
                        {p.active ? "Hide" : "Show"}
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => void remove(p._id!)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {showForm && (
        <div className="promo-work">
          <div>
            <section className="admin-section">
              <h3>1. What kind of offer?</h3>
              <div className="choice-grid">
                {KINDS.map((k) => (
                  <button
                    key={k.id}
                    type="button"
                    className={`choice${draft.kind === k.id ? " on" : ""}`}
                    onClick={() => setDraft((d) => ({ ...d, kind: k.id }))}
                  >
                    <i className={`fas ${k.icon}`} />
                    <strong>{k.title}</strong>
                    <span>{k.hint}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="admin-section">
              <h3>2. The words customers read</h3>
              <div className="form-group">
                <label>Short name *</label>
                <input
                  value={draft.title}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, title: e.target.value }))
                  }
                  placeholder="e.g. Festival 10% off"
                />
              </div>
              <div className="form-group">
                <label>One line under it</label>
                <input
                  value={draft.blurb}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, blurb: e.target.value }))
                  }
                  placeholder="e.g. On orders above Rs 2000"
                />
              </div>
              {draft.kind === "percent" && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Percent off</label>
                    <NumberInput
                      min={1}
                      max={90}
                      value={draft.percent}
                      onChange={(v) => setDraft((d) => ({ ...d, percent: v }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Only if cart is at least (Rs)</label>
                    <NumberInput
                      min={0}
                      value={draft.minAmount}
                      onChange={(v) =>
                        setDraft((d) => ({ ...d, minAmount: v }))
                      }
                    />
                  </div>
                </div>
              )}
              {draft.kind === "flat" && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Rupees off</label>
                    <NumberInput
                      min={0}
                      value={draft.flatOff}
                      onChange={(v) => setDraft((d) => ({ ...d, flatOff: v }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Only if cart is at least (Rs)</label>
                    <NumberInput
                      min={0}
                      value={draft.minAmount}
                      onChange={(v) =>
                        setDraft((d) => ({ ...d, minAmount: v }))
                      }
                    />
                  </div>
                </div>
              )}
              {draft.kind === "custom" && (
                <>
                  <div className="form-group">
                    <label>Your rule, in plain words</label>
                    <textarea
                      rows={2}
                      value={draft.customRule}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, customRule: e.target.value }))
                      }
                      placeholder="e.g. Buy 2 dress materials, get a free handkerchief. Or 15% extra on wholesale."
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Optional: also take % off at checkout</label>
                      <NumberInput
                        min={0}
                        max={90}
                        value={draft.percent}
                        onChange={(v) =>
                          setDraft((d) => ({ ...d, percent: v }))
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Or take rupees off</label>
                      <NumberInput
                        min={0}
                        value={draft.flatOff}
                        onChange={(v) =>
                          setDraft((d) => ({ ...d, flatOff: v }))
                        }
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Only if cart is at least (Rs)</label>
                    <NumberInput
                      min={0}
                      value={draft.minAmount}
                      onChange={(v) =>
                        setDraft((d) => ({ ...d, minAmount: v }))
                      }
                    />
                  </div>
                </>
              )}
              {draft.kind === "bogo" && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Buy this many</label>
                    <input
                      type="number"
                      min={2}
                      value={draft.buyQty}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          buyQty: Number(e.target.value) || 3,
                        }))
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Customer pays for</label>
                    <input
                      type="number"
                      min={1}
                      value={draft.payQty}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          payQty: Number(e.target.value) || 2,
                        }))
                      }
                    />
                  </div>
                </div>
              )}
              {draft.kind === "featured" && (
                <div className="form-group">
                  <label>Tick products to show on the homepage</label>
                  <div className="prod-pick">
                    {(products || []).map((p) => (
                      <label key={p._id}>
                        <input
                          type="checkbox"
                          checked={draft.productIds.includes(p._id)}
                          onChange={() =>
                            setDraft((d) => ({
                              ...d,
                              productIds: d.productIds.includes(p._id)
                                ? d.productIds.filter((id) => id !== p._id)
                                : [...d.productIds, p._id],
                            }))
                          }
                        />
                        {p.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div className="form-group">
                <label>Coupon code (optional)</label>
                <input
                  value={draft.coupon}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      coupon: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="Leave empty to apply automatically"
                />
                <small style={{ color: "var(--gray-500)" }}>
                  If you type SALE10, they must enter it at checkout. Empty
                  means it applies by itself.
                </small>
              </div>
              {draft.coupon && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Total uses allowed (0 = unlimited)</label>
                    <NumberInput
                      min={0}
                      value={draft.usageLimit}
                      onChange={(v) =>
                        setDraft((d) => ({ ...d, usageLimit: v }))
                      }
                    />
                    <small style={{ color: "var(--gray-500)" }}>
                      e.g. 25 lets only the first 25 redemptions through
                    </small>
                  </div>
                  <div className="form-group">
                    <label>Uses per customer (0 = unlimited)</label>
                    <NumberInput
                      min={0}
                      value={draft.perUserLimit}
                      onChange={(v) =>
                        setDraft((d) => ({ ...d, perUserLimit: v }))
                      }
                    />
                    <small style={{ color: "var(--gray-500)" }}>
                      1 stops the same customer reusing this code
                    </small>
                  </div>
                </div>
              )}
            </section>

            <section className="admin-section">
              <h3>3. Where should it appear?</h3>
              <p className="health-empty" style={{ marginBottom: 12 }}>
                Click a box. The picture on the right shows that page.
              </p>
              <div className="choice-grid places">
                {PLACES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`choice${draft.placements.includes(p.id) ? " on" : ""}`}
                    onClick={() => togglePlace(p.id)}
                  >
                    <strong>{p.title}</strong>
                    <span>{p.hint}</span>
                  </button>
                ))}
              </div>
            </section>

            <div className="promo-actions">
              <button
                className="btn btn-outline"
                disabled={saving}
                onClick={() => void save(false)}
              >
                Save as draft
              </button>
              <button
                className="btn btn-primary"
                disabled={saving}
                onClick={() => void save(true)}
              >
                Show to customers
              </button>
            </div>
          </div>

          <aside className="promo-preview-col">
            <div className="preview-head">
              <h3>This is how it will look</h3>
              <select
                value={previewAt}
                onChange={(e) => setPreviewAt(e.target.value)}
              >
                {PLACES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
            <PageMock
              place={previewAt}
              title={draft.title || "Your offer title"}
              blurb={draft.blurb || headline}
              coupon={draft.coupon}
            />
            <p className="preview-note">
              Nothing is live until you press Show to customers.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}

function labelFor(d: Promo) {
  if (d.kind === "percent")
    return `${d.percent || 0}% off${d.minAmount ? ` on Rs ${d.minAmount}+` : ""}`;
  if (d.kind === "bogo")
    return `Buy ${d.buyQty || 3}, pay for ${d.payQty || 2}`;
  if (d.kind === "flat")
    return `Rs ${d.flatOff || 0} off${d.minAmount ? ` on Rs ${d.minAmount}+` : ""}`;
  if (d.kind === "featured") return "Featured on the homepage";
  if (d.kind === "custom") return d.customRule || d.blurb || "Custom offer";
  return d.blurb || "Sale announcement";
}

function PageMock({
  place,
  title,
  blurb,
  coupon,
}: {
  place: string;
  title: string;
  blurb: string;
  coupon: string;
}) {
  const ad = (
    <div className="mock-ad">
      <strong>{title}</strong>
      <span>{blurb}</span>
      {coupon ? <em>Use code {coupon}</em> : null}
    </div>
  );
  return (
    <div className={`page-mock ${place}`}>
      {place === "home_top" && (
        <>
          {ad}
          <div className="mock-nav">Memon Cloth Store</div>
          <div className="mock-hero">Homepage</div>
        </>
      )}
      {place === "home_ticker" && (
        <>
          <div className="mock-nav">Memon Cloth Store</div>
          {ad}
          <div className="mock-hero">Homepage</div>
        </>
      )}
      {place === "shop_side" && (
        <>
          <div className="mock-nav">Shop</div>
          <div className="mock-shop">
            {ad}
            <div className="mock-grid">
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
        </>
      )}
      {place === "product" && (
        <>
          <div className="mock-nav">Product</div>
          {ad}
          <div className="mock-prod">
            <div className="mock-pic" />
            <div className="mock-info">
              Kurta set
              <br />
              Rs 2000
            </div>
          </div>
        </>
      )}
      {place === "checkout" && (
        <>
          <div className="mock-nav">Checkout</div>
          <div className="mock-check">
            <div className="mock-form">Name / Address / Pay</div>
            <div>
              {ad}
              <div className="mock-coupon">Coupon {coupon || "AUTO"}</div>
            </div>
          </div>
        </>
      )}
      {place === "popup" && (
        <>
          <div className="mock-nav">Memon Cloth Store</div>
          <div className="mock-hero dim">Homepage</div>
          <div className="mock-pop">
            {ad}
            <button type="button">Shop now</button>
          </div>
        </>
      )}
    </div>
  );
}

const DAY = 24 * 60 * 60 * 1000;

function ScheduleOverview({ list }: { list: Promo[] }) {
  const now = useMemo(() => new Date(), []);

  const reminders = useMemo(() => {
    const out: { tone: "warn" | "bad"; text: string }[] = [];
    for (const p of list) {
      if (p.active && p.endsAt) {
        const daysLeft = Math.ceil(
          (new Date(p.endsAt).getTime() - now.getTime()) / DAY,
        );
        if (daysLeft >= 0 && daysLeft <= 3) {
          out.push({
            tone: daysLeft <= 1 ? "bad" : "warn",
            text:
              daysLeft === 0
                ? `"${p.title}" ends today`
                : `"${p.title}" ends in ${daysLeft} day${daysLeft > 1 ? "s" : ""}`,
          });
        }
      }
      if (p.startsAt && new Date(p.startsAt) > now) {
        const daysAway = Math.ceil(
          (new Date(p.startsAt).getTime() - now.getTime()) / DAY,
        );
        out.push({
          tone: "warn",
          text: `"${p.title}" starts in ${daysAway} day${daysAway > 1 ? "s" : ""}${p.active ? "" : " (still a draft)"}`,
        });
      }
    }
    return out;
  }, [list, now]);

  const days = useMemo(() => {
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const cells: { date: Date | null; promos: Promo[] }[] = [];
    for (let i = 0; i < startOffset; i++)
      cells.push({ date: null, promos: [] });
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month, d);
      const promos = list.filter((p) => {
        if (!p.startsAt && !p.endsAt) return false;
        const start = p.startsAt ? new Date(p.startsAt) : null;
        const end = p.endsAt ? new Date(p.endsAt) : null;
        if (start && date < new Date(start.toDateString())) return false;
        if (end && date > new Date(end.toDateString())) return false;
        return true;
      });
      cells.push({ date, promos });
    }
    return cells;
  }, [list, now]);

  if (!reminders.length && !list.some((p) => p.startsAt || p.endsAt)) {
    return null;
  }

  return (
    <section className="admin-section">
      <h3>Schedule</h3>
      {reminders.length > 0 && (
        <div style={{ display: "grid", gap: 8, marginBottom: 20 }}>
          {reminders.map((r, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                borderRadius: "var(--radius)",
                background: "var(--off-white)",
                borderLeft: `3px solid ${r.tone === "bad" ? "var(--danger)" : "var(--warning)"}`,
                fontSize: ".85rem",
              }}
            >
              <i
                className={`fas fa-${r.tone === "bad" ? "exclamation-circle" : "clock"}`}
                style={{
                  color: r.tone === "bad" ? "var(--danger)" : "var(--warning)",
                }}
              />
              {r.text}
            </div>
          ))}
        </div>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 4,
          fontSize: ".78rem",
        }}
      >
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              color: "var(--gray-500)",
              fontWeight: 600,
              padding: "4px 0",
            }}
          >
            {d}
          </div>
        ))}
        {days.map((cell, i) => {
          const isToday =
            cell.date && cell.date.toDateString() === now.toDateString();
          return (
            <div
              key={i}
              title={cell.promos.map((p) => p.title).join(", ")}
              style={{
                minHeight: 44,
                borderRadius: 6,
                padding: "4px 6px",
                background: cell.promos.length
                  ? "rgba(184, 147, 63, 0.15)"
                  : "transparent",
                border: isToday ? "1.5px solid var(--gold)" : "none",
                color: cell.date ? "var(--ink)" : "transparent",
              }}
            >
              {cell.date ? cell.date.getDate() : "-"}
              {cell.promos.length > 0 && (
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "var(--gold)",
                    marginTop: 2,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

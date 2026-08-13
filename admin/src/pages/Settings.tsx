import { useEffect, useState, type FormEvent } from "react";
import { api, useAsync, type Settings } from "../lib/api.ts";
import { toast } from "../lib/toast.ts";

const DEFAULTS: Settings = {
  storeName: "MEMON CLOTH STORE",
  tagline: "Quality Fabrics at Affordable Prices",
  address:
    "Ghass Bazar Road, Near National Urdu Primary School, Kalyan West, Mumbai",
  phone: "+91 84528 03023",
  whatsapp: "918452803023",
  deliveryFee: "0",
  freeDeliveryMin: "0",
  freeDeliveryPins: "421301",
  freeDeliveryCities: "Kalyan",
  gstPercent: "0",
  gstInclusive: "false",
  codFee: "0",
};

export function SettingsPage() {
  const { data, reload } = useAsync(() => api<Settings>("/settings"), []);
  const [form, setForm] = useState(DEFAULTS);

  useEffect(() => {
    if (!data) return;
    setForm({ ...DEFAULTS, ...data });
  }, [data]);

  async function save(e: FormEvent) {
    e.preventDefault();
    try {
      await api("/settings", { method: "PUT", body: JSON.stringify(form) });
      toast("Settings saved");
    } catch {
      toast("Failed to save settings", "error");
    }
  }

  async function exportData() {
    try {
      const data = await api<unknown>("/admin/export");
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `memon-store-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast("Data exported successfully");
    } catch {
      toast("Failed to export data", "error");
    }
  }

  async function importData(file: File) {
    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      if (!confirm("This will replace all current data. Continue?")) return;
      await api("/admin/import", {
        method: "POST",
        body: JSON.stringify(parsed),
      });
      await reload();
      toast("Data imported successfully");
    } catch {
      toast("Invalid file format or import failed", "error");
    }
  }

  async function resetAll() {
    if (
      !confirm(
        "This will delete ALL data (products, orders, categories). This cannot be undone. Continue?",
      )
    )
      return;
    if (!confirm("Are you absolutely sure?")) return;
    try {
      await api("/admin/reset", { method: "POST" });
      toast("All data reset to defaults");
    } catch {
      toast("Failed to reset data", "error");
    }
  }

  function set<K extends keyof Settings>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <div className="tab-content">
      <div className="admin-header">
        <div>
          <h2>Settings</h2>
          <p>Store configuration and data management</p>
        </div>
      </div>
      <div className="admin-section">
        <h3>
          <i className="fas fa-store" /> Store Information
        </h3>
        <form onSubmit={(e) => void save(e)}>
          <div className="form-row">
            <div className="form-group">
              <label>Store Name</label>
              <input
                value={form.storeName || ""}
                onChange={(e) => set("storeName", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Tagline</label>
              <input
                value={form.tagline || ""}
                onChange={(e) => set("tagline", e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea
              rows={2}
              value={form.address || ""}
              onChange={(e) => set("address", e.target.value)}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={form.phone || ""}
                onChange={(e) => set("phone", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>WhatsApp Number</label>
              <input
                type="tel"
                value={form.whatsapp || ""}
                onChange={(e) => set("whatsapp", e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            <i className="fas fa-save" /> Save Settings
          </button>
        </form>
      </div>
      <div className="admin-section">
        <h3>
          <i className="fas fa-rupee-sign" /> Shipment charge and tax
        </h3>
        <p className="health-empty" style={{ marginBottom: 16 }}>
          Leave a box at 0 to skip that charge. You can change this after you
          confirm with the shop owner.
        </p>
        <form onSubmit={(e) => void save(e)}>
          <div className="form-row">
            <div className="form-group">
              <label>Shipment charge (Rs)</label>
              <input
                type="number"
                min={0}
                value={form.deliveryFee || "0"}
                onChange={(e) => set("deliveryFee", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Free delivery if cart is at least (Rs)</label>
              <input
                type="number"
                min={0}
                value={form.freeDeliveryMin || "0"}
                onChange={(e) => set("freeDeliveryMin", e.target.value)}
              />
              <small style={{ color: "var(--gray-500)" }}>
                0 means amount does not make delivery free
              </small>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Free delivery PIN codes</label>
              <textarea
                rows={2}
                value={form.freeDeliveryPins || ""}
                onChange={(e) => set("freeDeliveryPins", e.target.value)}
                placeholder="421301, 421302"
              />
            </div>
            <div className="form-group">
              <label>Free delivery cities</label>
              <textarea
                rows={2}
                value={form.freeDeliveryCities || ""}
                onChange={(e) => set("freeDeliveryCities", e.target.value)}
                placeholder="Kalyan, Dombivli"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>GST percent</label>
              <input
                type="number"
                min={0}
                max={28}
                value={form.gstPercent || "0"}
                onChange={(e) => set("gstPercent", e.target.value)}
              />
              <small style={{ color: "var(--gray-500)" }}>
                0 means do not add GST. Ask the owner if prices already include
                GST.
              </small>
            </div>
            <div className="form-group">
              <label>COD extra fee (Rs)</label>
              <input
                type="number"
                min={0}
                value={form.codFee || "0"}
                onChange={(e) => set("codFee", e.target.value)}
              />
            </div>
          </div>
          <label className="check-row">
            <input
              type="checkbox"
              checked={form.gstInclusive === "true"}
              onChange={(e) =>
                set("gstInclusive", e.target.checked ? "true" : "false")
              }
            />
            Product prices already include GST (only show the split, do not add
            extra)
          </label>
          <FeePreview form={form} />
          <button type="submit" className="btn btn-primary">
            <i className="fas fa-save" /> Save charges
          </button>
        </form>
      </div>
      <PaymentReady />
      <div className="admin-section">
        <h3>
          <i className="fas fa-database" /> Data Management
        </h3>
        <p
          style={{
            color: "var(--gray-500)",
            fontSize: ".9rem",
            marginBottom: 20,
          }}
        >
          Backup or restore your store data
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button className="btn btn-outline" onClick={() => void exportData()}>
            <i className="fas fa-download" /> Export All Data
          </button>
          <button
            className="btn btn-outline"
            onClick={() => document.getElementById("importFile")?.click()}
          >
            <i className="fas fa-upload" /> Import Data
          </button>
          <input
            id="importFile"
            type="file"
            accept=".json"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) void importData(file);
            }}
          />
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => void resetAll()}
          >
            <i className="fas fa-trash" /> Reset All Data
          </button>
        </div>
      </div>
    </div>
  );
}

function n(v?: string) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

function FeePreview({ form }: { form: Settings }) {
  const [cart, setCart] = useState("1500");
  const [pin, setPin] = useState("421301");
  const [city, setCity] = useState("Kalyan");
  const goods = n(cart);
  const fee = n(form.deliveryFee);
  const min = n(form.freeDeliveryMin);
  const pins = (form.freeDeliveryPins || "").toLowerCase();
  const cities = (form.freeDeliveryCities || "").toLowerCase();
  const pinHit =
    pin &&
    pins.replace(/\s/g, "").includes(pin.replace(/\s/g, "").toLowerCase());
  const cityHit = city && cities.includes(city.trim().toLowerCase());
  const amtHit = min > 0 && goods >= min;
  const ship = fee > 0 && !pinHit && !cityHit && !amtHit ? fee : 0;
  const gstP = n(form.gstPercent);
  const gst =
    gstP <= 0
      ? 0
      : form.gstInclusive === "true"
        ? Math.round((goods * gstP) / (100 + gstP))
        : Math.round((goods * gstP) / 100);
  const extraGst = form.gstInclusive === "true" ? 0 : gst;
  const total = goods + extraGst + ship;

  return (
    <div className="admin-section" style={{ margin: "16px 0", padding: 16 }}>
      <h3 style={{ fontSize: "1.05rem" }}>Try an example (not a real order)</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Cart Rs</label>
          <input value={cart} onChange={(e) => setCart(e.target.value)} />
        </div>
        <div className="form-group">
          <label>PIN</label>
          <input value={pin} onChange={(e) => setPin(e.target.value)} />
        </div>
        <div className="form-group">
          <label>City</label>
          <input value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
      </div>
      <p style={{ fontSize: ".9rem", color: "var(--ink)" }}>
        Delivery: <strong>{ship === 0 ? "Free" : `Rs ${ship}`}</strong>
        {gstP > 0 ? (
          <>
            {" "}
            · GST {gstP}%: <strong>Rs {gst}</strong>
            {form.gstInclusive === "true" ? " (already in price)" : ""}
          </>
        ) : null}{" "}
        · Customer pays: <strong>Rs {total}</strong>
      </p>
    </div>
  );
}

function PaymentReady() {
  const { data } = useAsync(
    () => api<{ configured: boolean; mode: string }>("/payment/ready"),
    [],
  );
  if (!data) return null;
  return (
    <div className="admin-section">
      <h3>
        <i className="fas fa-credit-card" /> Online payment (Razorpay)
      </h3>
      {!data.configured ? (
        <p>
          Online pay is <strong>off</strong>. Put RAZORPAY_KEY_ID and
          RAZORPAY_KEY_SECRET in the backend .env file, then restart the server.
        </p>
      ) : (
        <p>
          Online pay is <strong>on</strong> ({data.mode} mode).
          {data.mode === "test"
            ? " Use Razorpay test cards / UPI from their docs. No real money moves."
            : " This is LIVE. A real payment will take money."}{" "}
          After a customer pays, the order shows <strong>Paid</strong> and a
          Razorpay payment id.
        </p>
      )}
    </div>
  );
}

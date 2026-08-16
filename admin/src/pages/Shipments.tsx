import { useEffect, useState } from "react";
import {
  api,
  orderId,
  useAsync,
  type Order,
  type Settings,
} from "../lib/api.ts";
import { toast } from "../lib/toast.ts";

export function Shipments() {
  const {
    data: orders,
    error,
    loading,
    reload,
  } = useAsync(() => api<Order[]>("/orders"), []);

  const list = orders || [];
  const ready = list.filter(
    (o) => o.status !== "cancelled" && o.status !== "delivered",
  );
  const live = ready.filter((o) => o.shiprocket?.awbCode);
  const waiting = ready.filter((o) => !o.shiprocket?.awbCode);

  async function ship(id: string) {
    if (!confirm("Create a real Shiprocket shipment for this order?")) return;
    try {
      const data = await api<{ shiprocket?: { awbCode?: string } }>(
        `/orders/${id}/ship-shiprocket`,
        { method: "POST" },
      );
      toast(
        data.shiprocket?.awbCode
          ? `AWB ${data.shiprocket.awbCode}`
          : "Shipment created",
      );
      await reload();
    } catch (e) {
      toast((e as Error).message, "error");
    }
  }

  async function refresh(id: string) {
    try {
      await api(`/orders/${id}/refresh-track`, { method: "POST" });
      toast("Tracking updated");
      await reload();
    } catch (e) {
      toast((e as Error).message, "error");
    }
  }

  return (
    <div className="tab-content">
      <div className="admin-header">
        <div>
          <h2>Shipments</h2>
          <p>
            Shiprocket board: pack, ship, and share the tracking number with the
            customer.
          </p>
        </div>
        <button className="btn btn-outline" onClick={() => void reload()}>
          <i className="fas fa-sync-alt" /> Refresh
        </button>
      </div>

      <ChargeBox />

      {loading ? (
        <p>Loading…</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <>
          <section className="admin-section">
            <h3>Waiting to ship ({waiting.length})</h3>
            {!waiting.length ? (
              <p className="health-empty">Nothing waiting.</p>
            ) : (
              waiting.map((o) => (
                <div className="ship-row" key={o._id}>
                  <div>
                    <strong>#{orderId(o)}</strong>
                    <span>
                      {o.customer.name} · {o.customer.city} · ₹{o.total}
                    </span>
                  </div>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => void ship(o._id)}
                  >
                    <i className="fas fa-truck" /> Ship with Shiprocket
                  </button>
                </div>
              ))
            )}
          </section>
          <section className="admin-section">
            <h3>On the way ({live.length})</h3>
            {!live.length ? (
              <p className="health-empty">No live AWBs yet.</p>
            ) : (
              live.map((o) => (
                <div className="ship-row" key={o._id}>
                  <div>
                    <strong>#{orderId(o)}</strong>
                    <span>
                      AWB {o.shiprocket?.awbCode} ·{" "}
                      {o.shiprocket?.courierName || "Courier"} · {o.status}
                    </span>
                  </div>
                  <div className="actions">
                    <a
                      className="btn btn-sm btn-outline"
                      href={`https://shiprocket.co/tracking/${o.shiprocket?.awbCode}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Track
                    </a>
                    {o.shiprocket?.labelUrl ? (
                      <a
                        className="btn btn-sm btn-outline"
                        href={o.shiprocket.labelUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Label
                      </a>
                    ) : null}
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => void refresh(o._id)}
                    >
                      Update status
                    </button>
                  </div>
                </div>
              ))
            )}
          </section>
        </>
      )}
    </div>
  );
}

const FEE_DEFAULTS: Settings = {
  deliveryFee: "0",
  freeDeliveryMin: "0",
  freeDeliveryPins: "",
  freeDeliveryCities: "",
  codFee: "0",
};

function ChargeBox() {
  const { data } = useAsync(() => api<Settings>("/settings"), []);
  const [form, setForm] = useState(FEE_DEFAULTS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm((f) => ({ ...f, ...data }));
  }, [data]);

  function set(key: keyof Settings, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      await api("/settings", {
        method: "PUT",
        body: JSON.stringify({
          deliveryFee: form.deliveryFee || "0",
          freeDeliveryMin: form.freeDeliveryMin || "0",
          freeDeliveryPins: form.freeDeliveryPins || "",
          freeDeliveryCities: form.freeDeliveryCities || "",
          codFee: form.codFee || "0",
        }),
      });
      toast("Shipment charges saved. Checkout will use these now.");
    } catch {
      toast("Could not save charges", "error");
    } finally {
      setSaving(false);
    }
  }

  const fee = Number(form.deliveryFee) || 0;
  const min = Number(form.freeDeliveryMin) || 0;

  return (
    <section className="admin-section">
      <h3>Shipment charge</h3>
      <p className="health-empty" style={{ marginBottom: 16 }}>
        This is what the customer pays at checkout. 0 means free for everyone.
        {fee > 0
          ? ` Right now: Rs ${fee} per order`
          : " Right now: free delivery"}
        {min > 0 ? `, free if the cart is Rs ${min} or more` : ""}.
      </p>
      <div className="form-row">
        <div className="form-group">
          <label>Charge per order (Rs)</label>
          <input
            type="number"
            min={0}
            value={form.deliveryFee}
            onChange={(e) => set("deliveryFee", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Free if cart is at least (Rs)</label>
          <input
            type="number"
            min={0}
            value={form.freeDeliveryMin}
            onChange={(e) => set("freeDeliveryMin", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>COD extra (Rs)</label>
          <input
            type="number"
            min={0}
            value={form.codFee}
            onChange={(e) => set("codFee", e.target.value)}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Free shipment PIN codes</label>
          <textarea
            rows={2}
            value={form.freeDeliveryPins || ""}
            onChange={(e) => set("freeDeliveryPins", e.target.value)}
            placeholder="421301, 421302"
          />
        </div>
        <div className="form-group">
          <label>Free shipment cities</label>
          <textarea
            rows={2}
            value={form.freeDeliveryCities || ""}
            onChange={(e) => set("freeDeliveryCities", e.target.value)}
            placeholder="Kalyan, Dombivli"
          />
        </div>
      </div>
      <button
        type="button"
        className="btn btn-primary"
        disabled={saving}
        onClick={() => void save()}
      >
        Save shipment charges
      </button>
    </section>
  );
}

import {
  api,
  downloadBlob,
  orderId,
  useAsync,
  type Order,
} from "../lib/api.ts";
import { toast } from "../lib/toast.ts";

const STAGES = [
  "pending",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
];
const LABELS: Record<string, string> = {
  pending: "Pending",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function Orders() {
  const {
    data: orders,
    error,
    loading,
    reload,
  } = useAsync(() => api<Order[]>("/orders"), []);

  async function updateStatus(id: string, status: string) {
    const location = prompt("Enter location (optional):") || "";
    const notes = prompt("Enter tracking notes (optional):") || "";
    try {
      await api(`/orders/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status, location, notes }),
      });
      toast("Order status updated");
      await reload();
    } catch {
      toast("Failed to update order status", "error");
    }
  }

  async function updateReturn(id: string, status: string) {
    if (!status) return;
    try {
      await api(`/orders/${id}/return-status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      toast("Return request updated");
      await reload();
    } catch {
      toast("Failed to update return status", "error");
    }
  }

  async function invoice(id: string) {
    try {
      await downloadBlob(
        `/orders/${id}/invoice`,
        `invoice-${id.slice(-8).toUpperCase()}.pdf`,
      );
    } catch {
      toast("Failed to download invoice", "error");
    }
  }

  async function ship(id: string) {
    if (
      !confirm(
        "Ship this order via Shiprocket now? This will create a real shipment and assign a courier.",
      )
    )
      return;
    try {
      const data = await api<{ shiprocket?: { awbCode?: string } }>(
        `/orders/${id}/ship-shiprocket`,
        { method: "POST" },
      );
      toast(
        data.shiprocket?.awbCode
          ? `Shipped! AWB: ${data.shiprocket.awbCode}`
          : "Shipment created on Shiprocket",
      );
      await reload();
    } catch (e) {
      toast((e as Error).message || "Failed to ship via Shiprocket", "error");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this order?")) return;
    try {
      await api(`/orders/${id}`, { method: "DELETE" });
      toast("Order deleted");
      await reload();
    } catch {
      toast("Failed to delete order", "error");
    }
  }

  return (
    <div className="tab-content">
      <div className="admin-header">
        <div>
          <h2>Orders</h2>
          <p>View and manage customer orders</p>
        </div>
        <button className="btn btn-outline" onClick={() => void reload()}>
          <i className="fas fa-sync-alt" /> Refresh
        </button>
      </div>
      <div className="admin-section">
        {loading ? (
          <p>Loading…</p>
        ) : error ? (
          <p>{error}</p>
        ) : !orders?.length ? (
          <div className="empty-state">
            <i className="fas fa-inbox" />
            <h4>No orders yet</h4>
            <p>Orders will appear here when customers place them</p>
          </div>
        ) : (
          orders.map((o) => (
            <div className="order-card" key={o._id}>
              <div className="order-header">
                <div>
                  <div className="order-id">Order #{orderId(o)}</div>
                  <div className="order-date">
                    {new Date(o.createdAt || o.date || "").toLocaleString()}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <select
                    value={o.status}
                    onChange={(e) => void updateStatus(o._id, e.target.value)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "1px solid var(--gray-200)",
                      fontSize: ".8rem",
                    }}
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>
                        {LABELS[s]}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => void invoice(o._id)}
                    title="Download Invoice"
                  >
                    <i className="fas fa-file-pdf" />
                  </button>
                  {o.shiprocket?.awbCode ? (
                    <>
                      <span
                        className="btn btn-sm"
                        style={{
                          background: "rgba(37,211,102,0.1)",
                          color: "var(--success)",
                        }}
                        title={`AWB: ${o.shiprocket.awbCode} (${o.shiprocket.courierName})`}
                      >
                        <i className="fas fa-truck" /> Shipped
                      </span>
                      {o.shiprocket.labelUrl ? (
                        <a
                          href={o.shiprocket.labelUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm btn-outline"
                        >
                          <i className="fas fa-tag" /> Label
                        </a>
                      ) : null}
                    </>
                  ) : (
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => void ship(o._id)}
                      title="Ship via Shiprocket"
                    >
                      <i className="fas fa-truck" />
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => void remove(o._id)}
                  >
                    <i className="fas fa-trash" />
                  </button>
                </div>
              </div>
              <Tracking status={o.status} />
              {o.trackingLocation || o.trackingNotes ? (
                <div className="order-tracking-details">
                  {o.trackingLocation ? (
                    <div className="detail-row">
                      <i className="fas fa-map-marker-alt" />{" "}
                      <span>{o.trackingLocation}</span>
                    </div>
                  ) : null}
                  {o.trackingNotes ? (
                    <div className="detail-row">
                      <i className="fas fa-sticky-note" />{" "}
                      <span>{o.trackingNotes}</span>
                    </div>
                  ) : null}
                </div>
              ) : null}
              <div className="order-customer">
                <h5>{o.customer.name}</h5>
                <p>
                  {o.customer.phone}
                  {o.customer.email ? ` • ${o.customer.email}` : ""}
                </p>
                <p>
                  {o.customer.address}, {o.customer.city}, {o.customer.state} -{" "}
                  {o.customer.pin}
                </p>
              </div>
              <div className="order-items">
                {o.items.map((i, idx) => (
                  <div className="order-item" key={idx}>
                    <span>
                      {i.name} × {i.qty}
                    </span>
                    <span>₹{i.price * i.qty}</span>
                  </div>
                ))}
              </div>
              <div className="order-total">
                <span>
                  Total
                  {o.paymentStatus === "paid"
                    ? " · Paid online"
                    : o.payment === "cod" || o.paymentStatus === "cod"
                      ? " · COD"
                      : ` · ${o.payment}`}
                  {o.paymentId ? ` · ${o.paymentId}` : ""}
                </span>
                <strong>₹{o.total}</strong>
              </div>
              {o.notes ? (
                <div
                  style={{
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: "1px solid var(--gray-200)",
                    fontSize: ".82rem",
                    color: "var(--gray-500)",
                  }}
                >
                  <strong>Notes:</strong> {o.notes}
                </div>
              ) : null}
              {o.returnRequest?.requested ? (
                <div
                  style={{
                    marginTop: 12,
                    padding: 12,
                    background: "#fff8ec",
                    border: "1px solid #f0d9a8",
                    borderRadius: 8,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    <div>
                      <strong>
                        {o.returnRequest.type === "refund"
                          ? "Refund"
                          : "Replacement"}{" "}
                        Request
                      </strong>
                      <span
                        style={{
                          marginLeft: 8,
                          padding: "3px 10px",
                          borderRadius: 50,
                          fontSize: ".72rem",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          background: "rgba(243,156,18,0.15)",
                          color: "#b9770e",
                        }}
                      >
                        {o.returnRequest.status}
                      </span>
                    </div>
                    <select
                      defaultValue=""
                      onChange={(e) => void updateReturn(o._id, e.target.value)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 6,
                        border: "1px solid var(--gray-200)",
                        fontSize: ".8rem",
                      }}
                    >
                      <option value="">Update status...</option>
                      <option value="approved">Approve</option>
                      <option value="rejected">Reject</option>
                      <option value="completed">Mark Completed</option>
                    </select>
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: ".82rem",
                      color: "var(--gray-500)",
                    }}
                  >
                    Reason: {o.returnRequest.reason}
                  </div>
                  {o.returnRequest.returnAwbCode ? (
                    <div
                      style={{
                        marginTop: 6,
                        fontSize: ".82rem",
                        color: "var(--success)",
                      }}
                    >
                      <i className="fas fa-truck" /> Pickup booked — AWB:{" "}
                      {o.returnRequest.returnAwbCode} (
                      {o.returnRequest.returnCourierName})
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Tracking({ status }: { status: string }) {
  const stages = [
    "pending",
    "packed",
    "shipped",
    "out_for_delivery",
    "delivered",
  ];
  const idx = stages.indexOf(status);
  const cancelled = status === "cancelled";
  return (
    <div className="tracking-stages">
      {stages.map((s, i) => (
        <span key={s} style={{ display: "contents" }}>
          <span
            className={`tracking-stage ${cancelled ? "" : i < idx ? "completed" : i === idx ? "active" : ""}`}
          >
            {LABELS[s]}
          </span>
          {i < stages.length - 1 ? (
            <span className="tracking-arrow">
              <i className="fas fa-chevron-right" />
            </span>
          ) : null}
        </span>
      ))}
      {cancelled ? (
        <span
          className="tracking-stage active"
          style={{
            background: "rgba(220,53,69,.1)",
            color: "var(--danger)",
            marginLeft: 8,
          }}
        >
          Cancelled
        </span>
      ) : null}
    </div>
  );
}

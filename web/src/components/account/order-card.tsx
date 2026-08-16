"use client";

import { useState, useTransition } from "react";
import { cancelOrderAction, requestReturnAction } from "@/lib/actions/orders";
import type { Order } from "@/lib/types";

const STATUS_LABEL: Record<Order["status"], string> = {
  pending: "Pending",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const TRACKING_STAGES: {
  status: Order["status"];
  label: string;
  icon: string;
}[] = [
  { status: "pending", label: "Pending", icon: "fa-clock" },
  { status: "packed", label: "Packed", icon: "fa-box" },
  { status: "shipped", label: "Shipped", icon: "fa-truck" },
  {
    status: "out_for_delivery",
    label: "Out for Delivery",
    icon: "fa-shipping-fast",
  },
  { status: "delivered", label: "Delivered", icon: "fa-check-circle" },
];

export function OrderCard({ order }: { order: Order }) {
  const [showReturn, setShowReturn] = useState(false);
  const [reason, setReason] = useState("");
  const [type, setType] = useState<"replace" | "refund">("refund");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const orderNumber = order._id.slice(-8).toUpperCase();
  const canCancel = ["pending", "packed"].includes(order.status);
  const currentStageIndex = TRACKING_STAGES.findIndex(
    (s) => s.status === order.status,
  );
  const eligibleForReturn =
    order.status === "delivered" &&
    (!order.returnRequest || !order.returnRequest.requested) &&
    (Date.now() - new Date(order.createdAt).getTime()) /
      (1000 * 60 * 60 * 24) <=
      7;

  function handleCancel() {
    if (!confirm("Cancel this order?")) return;
    startTransition(async () => {
      const result = await cancelOrderAction(order._id);
      setMessage(result.ok ? "Order cancelled" : result.error);
    });
  }

  function handleReturnSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await requestReturnAction(order._id, type, reason);
      if (result.ok) {
        setMessage("Return request submitted");
        setShowReturn(false);
      } else {
        setMessage(result.error);
      }
    });
  }

  return (
    <div className="order-card">
      <div className="order-card-head">
        <div>
          <h4>Order #{orderNumber}</h4>
          <p className="date">
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <span className={`order-status-badge ${order.status}`}>
          {STATUS_LABEL[order.status]}
        </span>
      </div>

      {order.status !== "cancelled" && (
        <div className="tracking-timeline">
          {TRACKING_STAGES.map((stage, i) => {
            const cls =
              i < currentStageIndex
                ? "completed"
                : i === currentStageIndex
                  ? "current"
                  : "";
            return (
              <div key={stage.status} className={`tracking-stage ${cls}`}>
                <div className="tracking-dot">
                  <i className={`fas ${stage.icon}`} />
                </div>
                <div className="tracking-label">{stage.label}</div>
              </div>
            );
          })}
        </div>
      )}

      {order.shiprocket?.awbCode && (
        <div className="shiprocket-card">
          <div>
            <div className="label">Tracking Number</div>
            <div className="awb">{order.shiprocket.awbCode}</div>
            <div className="courier">
              via {order.shiprocket.courierName || "Courier"}
            </div>
            {order.shiprocket.estimatedDelivery && (
              <div className="eta">
                <i className="fas fa-calendar-check" /> Estimated delivery:{" "}
                {order.shiprocket.estimatedDelivery}
              </div>
            )}
          </div>
          <a
            href={`https://shiprocket.co/tracking/${order.shiprocket.awbCode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            <i className="fas fa-map-marker-alt" /> Track Package
          </a>
        </div>
      )}

      <ul className="order-items-list">
        {order.items.map((item, i) => (
          <li key={i}>
            {item.name}
            {item.size ? ` (${item.size})` : ""} × {item.qty} - ₹
            {item.price * item.qty}
          </li>
        ))}
      </ul>

      <div className="order-card-foot">
        <strong>
          Total: ₹{order.total}
          <span
            style={{
              display: "block",
              fontSize: "0.75rem",
              fontWeight: 500,
              color: "var(--gray-500)",
            }}
          >
            {order.paymentStatus === "paid"
              ? `Paid online${order.paymentId ? ` · ${order.paymentId}` : ""}`
              : order.payment === "cod" || order.paymentStatus === "cod"
                ? "Cash on delivery"
                : "Payment pending"}
          </span>
        </strong>
        <div className="order-actions">
          {canCancel && (
            <button
              className="btn btn-outline"
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancel Order
            </button>
          )}
          {eligibleForReturn && (
            <button
              className="btn btn-outline"
              onClick={() => setShowReturn((v) => !v)}
            >
              Request Replace / Refund
            </button>
          )}
        </div>
      </div>

      {order.returnRequest?.requested && (
        <p
          style={{
            marginTop: 10,
            fontSize: "0.78rem",
            color: "var(--gray-700)",
          }}
        >
          Return status: <strong>{order.returnRequest.status}</strong>
        </p>
      )}

      {message && (
        <p
          style={{
            marginTop: 10,
            fontSize: "0.78rem",
            color: "var(--gold-dark)",
          }}
        >
          {message}
        </p>
      )}

      {showReturn && (
        <form className="return-form" onSubmit={handleReturnSubmit}>
          <div style={{ display: "flex", gap: 16, fontSize: "0.9rem" }}>
            <label>
              <input
                type="radio"
                checked={type === "refund"}
                onChange={() => setType("refund")}
              />{" "}
              Refund
            </label>
            <label>
              <input
                type="radio"
                checked={type === "replace"}
                onChange={() => setType("replace")}
              />{" "}
              Replace
            </label>
          </div>
          <textarea
            placeholder="Tell us the reason..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            rows={2}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isPending}
          >
            Submit Request
          </button>
        </form>
      )}
    </div>
  );
}

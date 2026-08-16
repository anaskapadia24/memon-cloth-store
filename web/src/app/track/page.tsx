"use client";

import { useState } from "react";

type TrackResult = {
  orderId: string;
  status: string;
  shiprocket?: {
    awbCode?: string;
    courierName?: string;
    estimatedDelivery?: string;
    status?: string;
  };
  tracking?: { status: string; notes?: string; timestamp?: string }[];
};

export default function TrackPage() {
  const [q, setQ] = useState("");
  const [data, setData] = useState<TrackResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function go(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setData(null);
    try {
      const looksAwb = /[a-zA-Z]/.test(q);
      const qs = looksAwb
        ? `awb=${encodeURIComponent(q)}`
        : `order=${encodeURIComponent(q)}`;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api"}/orders/track?${qs}`,
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Not found");
      setData(json);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="checkout-page">
      <div
        className="container"
        style={{ maxWidth: 560, padding: "60px 24px" }}
      >
        <h1 className="section-title">Track your order</h1>
        <p className="section-subtitle">
          Enter the last 8 letters of your order number, or the courier AWB.
        </p>
        <form
          onSubmit={(e) => void go(e)}
          className="coupon-row"
          style={{ marginTop: 24 }}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value.trim())}
            placeholder="Order no. or AWB"
          />
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? "Checking…" : "Track"}
          </button>
        </form>
        {error ? (
          <p className="form-error" style={{ marginTop: 16 }}>
            {error}
          </p>
        ) : null}
        {data ? (
          <div className="shiprocket-card" style={{ marginTop: 24 }}>
            <div>
              <div className="label">Order {data.orderId}</div>
              <div className="awb">{data.status}</div>
              {data.shiprocket?.awbCode ? (
                <div className="courier">
                  {data.shiprocket.courierName} · {data.shiprocket.awbCode}
                </div>
              ) : (
                <p>
                  Packed at the store. Courier number appears after we ship.
                </p>
              )}
            </div>
            {data.shiprocket?.awbCode ? (
              <a
                className="btn btn-primary"
                href={`https://shiprocket.co/tracking/${data.shiprocket.awbCode}`}
                target="_blank"
                rel="noreferrer"
              >
                Open courier track
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

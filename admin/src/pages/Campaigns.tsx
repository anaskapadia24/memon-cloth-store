import { useState } from "react";
import { api, useAsync } from "../lib/api.ts";
import { toast } from "../lib/toast.ts";

export function Campaigns() {
  const { data, loading, reload } = useAsync(
    () => api<{ count: number }>("/campaigns/subscriber-count"),
    [],
  );
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [testing, setTesting] = useState(false);

  const canSend = subject.trim() && message.trim();

  async function sendTest() {
    setTesting(true);
    try {
      await api("/campaigns/send", {
        method: "POST",
        body: JSON.stringify({ subject, message, test: true }),
      });
      toast("Test email sent to your inbox");
    } catch (e) {
      toast((e as Error).message || "Failed to send test", "error");
    } finally {
      setTesting(false);
    }
  }

  async function sendToAll() {
    if (
      !confirm(
        `Send this to all ${data?.count ?? 0} subscribed customers? This can't be undone.`,
      )
    )
      return;
    setSending(true);
    try {
      const res = await api<{ sent: number }>("/campaigns/send", {
        method: "POST",
        body: JSON.stringify({ subject, message, test: false }),
      });
      toast(`Sending to ${res.sent} customers`);
      setSubject("");
      setMessage("");
    } catch (e) {
      toast((e as Error).message || "Failed to send campaign", "error");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="tab-content">
      <div className="admin-header">
        <div>
          <h2>Marketing Emails</h2>
          <p>Send a promotional email to your subscribed customers</p>
        </div>
        <button className="btn btn-outline" onClick={() => void reload()}>
          <i className="fas fa-sync-alt" /> Refresh
        </button>
      </div>
      <div className="admin-section" style={{ maxWidth: 640 }}>
        <p
          style={{
            fontSize: ".85rem",
            color: "var(--gray-500)",
            marginBottom: 20,
          }}
        >
          {loading
            ? "Loading subscriber count…"
            : `Reaches ${data?.count ?? 0} customers who haven't unsubscribed.`}
        </p>
        <div className="form-group">
          <label>Subject *</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. New Winter Collection is here!"
          />
        </div>
        <div className="form-group">
          <label>Message *</label>
          <textarea
            rows={8}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your announcement here. Each line becomes its own paragraph in the email."
          />
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            type="button"
            className="btn btn-outline"
            disabled={!canSend || testing}
            onClick={() => void sendTest()}
          >
            <i className="fas fa-paper-plane" />{" "}
            {testing ? "Sending…" : "Send Test to Myself"}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!canSend || sending}
            onClick={() => void sendToAll()}
          >
            <i className="fas fa-bullhorn" />{" "}
            {sending ? "Sending…" : "Send to All Customers"}
          </button>
        </div>
      </div>
    </div>
  );
}

import { api, useAsync, type Review } from "../lib/api.ts";
import { toast } from "../lib/toast.ts";

export function Reviews() {
  const {
    data: reviews,
    error,
    loading,
    reload,
  } = useAsync(() => api<Review[]>("/reviews"), []);

  async function remove(id: string) {
    if (!confirm("Delete this review?")) return;
    try {
      await api(`/reviews/${id}`, { method: "DELETE" });
      toast("Review deleted");
      await reload();
    } catch {
      toast("Failed to delete review", "error");
    }
  }

  async function setStatus(id: string, status: "approved" | "rejected") {
    try {
      await api(`/reviews/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      toast(status === "approved" ? "Review approved" : "Review rejected");
      await reload();
    } catch {
      toast("Failed to update review", "error");
    }
  }

  return (
    <div className="tab-content">
      <div className="admin-header">
        <div>
          <h2>Reviews</h2>
          <p>
            {reviews?.filter((r) => r.status === "pending").length
              ? `${reviews.filter((r) => r.status === "pending").length} awaiting approval`
              : "Manage customer reviews"}
          </p>
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
        ) : !reviews?.length ? (
          <div className="empty-state">
            <i className="fas fa-star" />
            <h4>No reviews yet</h4>
            <p>Customer reviews will appear here</p>
          </div>
        ) : (
          reviews.map((r) => {
            const productName =
              typeof r.productId === "object"
                ? r.productId?.name
                : "Unknown Product";
            const status = r.status || "approved";
            return (
              <div
                className="review-card"
                key={r._id}
                style={
                  status === "pending"
                    ? { border: "1px solid var(--gold)" }
                    : undefined
                }
              >
                <div className="review-header">
                  <div>
                    <div className="review-product">
                      <i
                        className="fas fa-box"
                        style={{ marginRight: 4, color: "var(--gold)" }}
                      />{" "}
                      {productName || "Unknown Product"}
                    </div>
                    <div className="review-user">
                      <i
                        className="fas fa-user"
                        style={{ marginRight: 4, color: "var(--gray-500)" }}
                      />{" "}
                      {r.userName || r.name || "Anonymous"}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="review-stars">
                      {Array.from({ length: 5 }, (_, i) => (
                        <i
                          key={i}
                          className={`fas fa-star ${i < (r.rating || 0) ? "" : "empty"}`}
                        />
                      ))}
                    </div>
                    <div className="review-meta">
                      {new Date(r.createdAt || r.date || "").toLocaleDateString(
                        "en-IN",
                      )}
                    </div>
                    {status !== "approved" && (
                      <div
                        style={{
                          fontSize: ".72rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: ".05em",
                          color:
                            status === "pending"
                              ? "var(--gold-dark)"
                              : "var(--danger)",
                          marginTop: 4,
                        }}
                      >
                        {status}
                      </div>
                    )}
                  </div>
                </div>
                <div className="review-body">{r.comment || r.text || ""}</div>
                {r.images && r.images.length > 0 && (
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    {r.images.map((src) => (
                      <a key={src} href={src} target="_blank" rel="noreferrer">
                        <img
                          src={src}
                          alt=""
                          style={{
                            width: 64,
                            height: 64,
                            borderRadius: 8,
                            objectFit: "cover",
                          }}
                        />
                      </a>
                    ))}
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 12,
                    justifyContent: "flex-end",
                  }}
                >
                  {status !== "approved" && (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => void setStatus(r._id, "approved")}
                    >
                      <i className="fas fa-check" /> Approve
                    </button>
                  )}
                  {status !== "rejected" && (
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => void setStatus(r._id, "rejected")}
                    >
                      <i className="fas fa-ban" /> Reject
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => void remove(r._id)}
                  >
                    <i className="fas fa-trash" /> Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

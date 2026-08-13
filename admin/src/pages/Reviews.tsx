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

  return (
    <div className="tab-content">
      <div className="admin-header">
        <div>
          <h2>Reviews</h2>
          <p>Manage customer reviews</p>
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
            return (
              <div className="review-card" key={r._id}>
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
                  </div>
                </div>
                <div className="review-body">{r.comment || r.text || ""}</div>
                <div style={{ marginTop: 12, textAlign: "right" }}>
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

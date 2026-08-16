import { getProductReviews } from "@/lib/products";
import { ReviewForm } from "./review-form";

export async function ReviewsSection({ productId }: { productId: string }) {
  const reviews = await getProductReviews(productId).catch(() => []);
  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="reviews-section">
      <div className="reviews-header">
        <h2>Customer Reviews</h2>
        {reviews.length > 0 && (
          <div className="reviews-summary">
            <span className="reviews-avg">{avg.toFixed(1)}</span>
            <span className="reviews-stars">
              {"★".repeat(Math.round(avg))}
              {"☆".repeat(5 - Math.round(avg))}
            </span>
            <span className="reviews-count">
              ({reviews.length} review{reviews.length > 1 ? "s" : ""})
            </span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <p style={{ color: "var(--gray-500)" }}>
          No reviews yet - be the first to share your thoughts.
        </p>
      ) : (
        <div>
          {reviews.map((r) => (
            <div key={r._id} className="review-card">
              <div className="review-author">{r.userName}</div>
              <div className="review-date">
                {new Date(r.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
              <div className="review-stars">
                {"★".repeat(r.rating)}
                {"☆".repeat(5 - r.rating)}
              </div>
              <p className="review-text">{r.comment}</p>
              {r.images && r.images.length > 0 && (
                <div className="review-card-images">
                  {r.images.map((src) => (
                    <img key={src} src={src} alt="" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ReviewForm productId={productId} />
    </div>
  );
}

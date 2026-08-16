"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { createReviewAction } from "@/lib/actions/reviews";

type Preview = { src: string; file: File };

export function ReviewForm({ productId }: { productId: string }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<Preview[]>([]);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  function addFiles(files: File[]) {
    const room = 4 - images.length;
    const next = files
      .filter((f) => f.type.startsWith("image/") && f.size <= 5 * 1024 * 1024)
      .slice(0, Math.max(0, room));
    setImages((cur) => [
      ...cur,
      ...next.map((file) => ({ src: URL.createObjectURL(file), file })),
    ]);
  }

  if (!user) {
    return (
      <p
        style={{ marginTop: 24, color: "var(--gray-700)", fontSize: "0.9rem" }}
      >
        <Link
          href="/login"
          style={{
            color: "var(--gold-dark)",
            fontWeight: 600,
            textDecoration: "underline",
          }}
        >
          Log in
        </Link>{" "}
        to write a review.
      </p>
    );
  }

  if (done) {
    return (
      <p style={{ marginTop: 24, color: "var(--success)", fontWeight: 600 }}>
        Thanks! Your review is pending approval and will appear here once it's
        checked.
      </p>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await createReviewAction(
        productId,
        rating,
        comment,
        images.map((img) => img.file),
      );
      if (result.ok) setDone(true);
      else setError(result.error);
    });
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3>Write a Review</h3>
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <i
            key={n}
            className={`fas fa-star${n <= (hoverRating || rating) ? " active" : ""}`}
            onMouseEnter={() => setHoverRating(n)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(n)}
          />
        ))}
      </div>
      <textarea
        placeholder="Share your experience with this product..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        required
        minLength={5}
        maxLength={1000}
      />
      <div className="review-form-images">
        <label htmlFor="review-image-input" className="review-image-add">
          <i className="fas fa-camera" /> Add photos (optional, up to 4)
        </label>
        <input
          id="review-image-input"
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => addFiles(Array.from(e.target.files || []))}
        />
        {images.length > 0 && (
          <div className="review-image-previews">
            {images.map((img, i) => (
              <div className="review-image-thumb" key={img.src}>
                <img src={img.src} alt="" />
                <button
                  type="button"
                  onClick={() =>
                    setImages((cur) => cur.filter((_, j) => j !== i))
                  }
                  aria-label="Remove photo"
                >
                  <i className="fas fa-times" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" className="btn btn-outline" disabled={isPending}>
        {isPending ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}

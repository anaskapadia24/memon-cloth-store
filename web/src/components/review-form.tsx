"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { createReviewAction } from "@/lib/actions/reviews";

export function ReviewForm({ productId }: { productId: string }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

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
        Thanks for your review!
      </p>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await createReviewAction(productId, rating, comment);
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
      {error && <p className="form-error">{error}</p>}
      <button type="submit" className="btn btn-outline" disabled={isPending}>
        {isPending ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}

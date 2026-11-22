"use client";

import { useEffect, useState, type FormEvent } from "react";
import ReviewCard from "@/components/trust/ReviewCard";
import { StarPicker } from "@/components/trust/Stars";
import { createReview, getOrderReviewStatus } from "@/lib/api";
import type { Order } from "@/types/order";
import type { OrderReviewStatus } from "@/types/trust";

export default function OrderReview({ order }: { order: Order }) {
  const [status, setStatus] = useState<OrderReviewStatus | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const otherRole = order.my_role === "borrower" ? "lender" : "borrower";
  const otherName = order.my_role === "borrower" ? order.lender : order.borrower;

  useEffect(() => {
    async function load() {
      try {
        setStatus(await getOrderReviewStatus(order.id));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load reviews.");
      }
    }
    load();
  }, [order.id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (rating === 0) {
      setError("Choose a rating.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const review = await createReview({ order: order.id, rating, comment: comment.trim() });
      setStatus((current) =>
        current ? { ...current, can_review: false, reason: null, my_review: review } : current,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit your review.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold">Reviews</h2>

      {status?.can_review && (
        <form onSubmit={handleSubmit} className="mt-3 rounded-lg border border-gray-200 p-4">
          <p className="mb-3 text-sm text-gray-600">
            Rate the {otherRole}, {otherName}.
          </p>
          <StarPicker name={`order-${order.id}-rating`} value={rating} onChange={setRating} disabled={busy} />
          <label className="mt-3 block text-sm">
            <span className="text-gray-500">Comment (optional)</span>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              rows={3}
              disabled={busy}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="mt-3 rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {busy ? "Submitting..." : "Submit review"}
          </button>
        </form>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {status?.my_review && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-gray-600">Your review of the {otherRole}</p>
          <ReviewCard review={status.my_review} showRole={false} />
        </div>
      )}

      {status?.their_review && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-gray-600">Their review of you</p>
          <ReviewCard review={status.their_review} showRole={false} />
        </div>
      )}

      {status && !status.can_review && !status.my_review && !status.their_review && (
        <p className="mt-2 text-sm text-gray-500">No reviews yet.</p>
      )}
    </div>
  );
}

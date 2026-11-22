"use client";

import { useEffect, useRef, useState } from "react";
import ReviewCard from "@/components/trust/ReviewCard";
import { getUserReviews } from "@/lib/api";
import type { Review, ReviewRole } from "@/types/trust";

type Tab = "all" | ReviewRole;

const TABS: { value: Tab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "lender", label: "As lender" },
  { value: "borrower", label: "As borrower" },
];

type ReviewListProps = {
  userId: number;
  title: string;
  emptyText?: string;
};

function fetchReviews(userId: number, tab: Tab, page: number) {
  return getUserReviews(userId, { role: tab === "all" ? undefined : tab, page });
}

export default function ReviewList({ userId, title, emptyText = "No reviews yet." }: ReviewListProps) {
  const [tab, setTab] = useState<Tab>("all");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const generation = useRef(0);

  useEffect(() => {
    const current = ++generation.current;

    fetchReviews(userId, tab, 1)
      .then((data) => {
        if (current !== generation.current) return;
        setReviews(data.results);
        setCount(data.count);
        setPage(1);
        setHasMore(Boolean(data.next));
      })
      .catch((err: unknown) => {
        if (current === generation.current) setError(err instanceof Error ? err.message : "Couldn't load reviews.");
      })
      .finally(() => {
        if (current === generation.current) setLoading(false);
      });
  }, [userId, tab]);

  function selectTab(next: Tab) {
    if (next === tab) return;
    setTab(next);
    setReviews([]);
    setCount(0);
    setHasMore(false);
    setError(null);
    setLoading(true);
  }

  async function loadMore() {
    const current = generation.current;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchReviews(userId, tab, page + 1);
      if (current !== generation.current) return;
      setReviews((existing) => [...existing, ...data.results]);
      setCount(data.count);
      setPage(page + 1);
      setHasMore(Boolean(data.next));
    } catch (err) {
      if (current === generation.current) setError(err instanceof Error ? err.message : "Couldn't load reviews.");
    } finally {
      if (current === generation.current) setLoading(false);
    }
  }

  return (
    <section>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {title}
          {!loading || reviews.length ? (
            <span className="ml-2 text-sm font-normal text-gray-500">{count}</span>
          ) : null}
        </h2>
        <div role="tablist" aria-label="Filter reviews" className="flex rounded-lg bg-gray-100 p-1 text-sm">
          {TABS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              onClick={() => selectTab(value)}
              className={`rounded-md px-3 py-1.5 font-medium transition ${
                tab === value ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div role="tabpanel" className="mt-4">
        {reviews.length > 0 && (
          <ul className="divide-y divide-gray-100">
            {reviews.map((review) => (
              <li key={review.id} className="py-4 first:pt-0">
                <ReviewCard review={review} showRole={tab === "all"} />
              </li>
            ))}
          </ul>
        )}

        {!loading && !error && reviews.length === 0 && <p className="text-sm text-gray-500">{emptyText}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {loading && <p className="text-sm text-gray-500">Loading reviews...</p>}

        {hasMore && !loading && (
          <button
            type="button"
            onClick={loadMore}
            className="mt-4 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Load more
          </button>
        )}
      </div>
    </section>
  );
}

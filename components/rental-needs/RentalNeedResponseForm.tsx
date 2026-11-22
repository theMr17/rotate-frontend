"use client";

import { useState } from "react";
import Link from "next/link";

import { respondToRentalNeed } from "@/lib/rental-needs-api";
import type { Item } from "@/types/item";

type Props = {
  needId: number;
  items: Item[];
  onSuccess: () => void;
};

export default function RentalNeedResponseForm({
  needId,
  items,
  onSuccess,
}: Props) {
  const availableItems = items.filter(
    (item) => item.status === "AVAILABLE",
  );

  const [itemId, setItemId] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleItemChange(value: string) {
    setItemId(value);

    const selected = availableItems.find(
      (item) => item.id.toString() === value,
    );

    // Prefill the offer using the item's listed rate.
    if (selected) {
      setHourlyRate(selected.hourly_rate);
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!itemId) {
      setError("Please select an item.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await respondToRentalNeed(needId, {
        item: Number(itemId),
        hourly_rate: Number(hourlyRate).toFixed(2),
        message,
      });

      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not submit your offer.",
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900">
        Offer an item
      </h2>

      <p className="mt-2 text-sm text-gray-500">
        Select an item from your listings and propose your rental rate.
      </p>

      {availableItems.length === 0 ? (
        <div className="mt-5 rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-700">
            You don&apos;t have any available items to offer.
          </p>

          <Link
            href="/items/new"
            className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:underline"
          >
            List an item first →
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="response-item"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Select your item
            </label>

            <select
              id="response-item"
              required
              value={itemId}
              onChange={(event) => handleItemChange(event.target.value)}
              className={inputClass}
            >
              <option value="">Choose an item</option>

              {availableItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} — ₹{item.hourly_rate}/hour
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="response-rate"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Your proposed rate (₹ per hour)
            </label>

            <input
              id="response-rate"
              type="number"
              required
              min="0.01"
              step="0.01"
              value={hourlyRate}
              onChange={(event) => setHourlyRate(event.target.value)}
              placeholder="e.g. 90"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="response-message"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Message
            </label>

            <textarea
              id="response-message"
              rows={3}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Tell the requester why your item is suitable."
              className={inputClass}
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !itemId || !hourlyRate}
            className="w-full rounded-md bg-emerald-600 px-4 py-3 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Submitting offer..." : "Submit offer"}
          </button>
        </form>
      )}
    </section>
  );
}
"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";

type Props = {
  orderId: number;
  initialRate?: string;
  onSuccess: () => void;
};

export default function RentalNeedCounterOfferForm({
  orderId,
  initialRate = "",
  onSuccess,
}: Props) {
  const [rate, setRate] = useState(initialRate);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError(null);

    try {
      await apiPost(
        `/orders/${orderId}/counter/`,
        {
          hourly_rate: Number(rate).toFixed(2),
          message,
        },
      );

      setMessage("");
      onSuccess();

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not submit counteroffer.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4"
    >
      <h4 className="font-semibold text-gray-900">
        Make a counteroffer
      </h4>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Proposed rate (₹/hour)
          </label>

          <input
            type="number"
            min="0.01"
            step="0.01"
            required
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="e.g. 85"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Message
          </label>

          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Optional message"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:border-emerald-500"
          />
        </div>

      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !rate || Number(rate) <= 0}
        className="mt-3 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {loading ? "Submitting..." : "Submit counteroffer"}
      </button>
    </form>
  );
}
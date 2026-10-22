"use client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { apiPost } from "@/lib/api";
import type { Order } from "@/types/order";

type Props = {
  itemId: number;
  hourlyRate: string;
};

export default function RentalRequestForm({ itemId, hourlyRate }: Props) {
  const router = useRouter();
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [rate, setRate] = useState(hourlyRate);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (startTime === "" || endTime === "") {
      setError("Choose a start and end time.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const order = await apiPost<Order>("/orders/", {
        item: itemId,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        hourly_rate: rate,
        message: message,
      });
      router.push(`/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send your request.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-gray-200 p-5">
      <h2 className="text-lg font-semibold">Request to rent</h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="text-gray-500">From</span>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="text-gray-500">To</span>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </label>
      </div>

      <label className="mt-4 block text-sm">
        <span className="text-gray-500">Your offer (Rs per hour)</span>
        <input
          type="number"
          min="1"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </label>

      <label className="mt-4 block text-sm">
        <span className="text-gray-500">Message to the owner (optional)</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </label>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="mt-4 w-full rounded-md bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {busy ? "Sending..." : "Send request"}
      </button>
    </form>
  );
}
"use client";

import { useState } from "react";

import { apiPost } from "@/lib/api";
import type { Order } from "@/types/order";

type Props = {
  order: Order;
  onResolved: (updated: Order) => void;
};

export default function ResolveDispute({ order, onResolved }: Props) {
  const [deduction, setDeduction] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const deposit = Number(order.deposit_amount);
  const refundPreview = deposit - Number(deduction || 0);

  async function handleResolve() {
    if (deduction === "") {
      setError("Enter the amount to deduct (0 if there is no damage).");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const updated = await apiPost<Order>(`/orders/${order.id}/resolve/`, {
        deduction: deduction,
        note: note,
      });
      onResolved(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resolve the dispute.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="font-medium">Resolve dispute (admin)</p>
      <p className="mt-1 text-sm text-gray-600">
        Compare the before and after photos, then decide how much of the Rs{order.deposit_amount} deposit
        goes to the lender.
      </p>

      <label className="mt-3 block text-sm">
        <span className="text-gray-600">Deduct from deposit (Rs)</span>
        <input
          type="number"
          min="0"
          max={deposit}
          value={deduction}
          onChange={(e) => setDeduction(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2"
        />
      </label>

      <label className="mt-3 block text-sm">
        <span className="text-gray-600">Note (reason)</span>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2"
        />
      </label>

      <p className="mt-3 text-sm">Borrower will get back: Rs{refundPreview.toFixed(2)}</p>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <button
        onClick={handleResolve}
        disabled={busy}
        className="mt-3 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
      >
        {busy ? "Resolving..." : "Resolve dispute"}
      </button>
    </div>
  );
}
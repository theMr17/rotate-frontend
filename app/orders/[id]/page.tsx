"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import StatusBadge from "@/components/orders/StatusBadge";
import { apiGet, apiPost } from "@/lib/api";
import type { Order } from "@/types/order";

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [counterRate, setCounterRate] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      try {
        const data = await apiGet<Order>(`/orders/${id}/`);
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load this order.");
      }
    }
    loadOrder();
  }, [id]);

  async function runAction(action: string, body: object) {
    setBusy(true);
    setError(null);
    try {
      const updated = await apiPost<Order>(`/orders/${id}/${action}/`, body);
      setOrder(updated);
      setCounterRate("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  function sendCounter() {
    if (counterRate === "") {
      setError("Enter a price for your counter offer.");
      return;
    }
    runAction("counter", { hourly_rate: counterRate });
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p className={error ? "text-red-600" : "text-gray-500"}>{error ?? "Loading order..."}</p>
      </main>
    );
  }

  const actions = order.available_actions;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/orders" className="text-sm text-emerald-700 hover:underline">
        Back to My Orders
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{order.item_title}</h1>
        <StatusBadge status={order.status} />
      </div>
      <p className="mt-1 text-sm text-gray-500">You are the {order.my_role}</p>

      <div className="mt-6 grid grid-cols-2 gap-4 rounded-lg border border-gray-200 p-4 text-sm">
        <div>
          <p className="text-gray-500">Borrower</p>
          <p className="font-medium">{order.borrower}</p>
        </div>
        <div>
          <p className="text-gray-500">Lender</p>
          <p className="font-medium">{order.lender}</p>
        </div>
        <div>
          <p className="text-gray-500">From</p>
          <p className="font-medium">{formatTime(order.start_time)}</p>
        </div>
        <div>
          <p className="text-gray-500">To</p>
          <p className="font-medium">{formatTime(order.end_time)}</p>
        </div>
        <div>
          <p className="text-gray-500">Agreed rate</p>
          <p className="font-medium">
            {order.agreed_hourly_rate ? `Rs ${order.agreed_hourly_rate}/hr` : "Not agreed yet"}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Deposit</p>
          <p className="font-medium">Rs {order.deposit_amount}</p>
        </div>
      </div>

      <h2 className="mt-8 text-lg font-semibold">Negotiation</h2>
      <ol className="mt-3 space-y-3">
        {order.offers.map((offer) => (
          <li key={offer.id} className="rounded-lg bg-gray-50 p-3 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">
                {offer.proposed_by} offered Rs {offer.hourly_rate}/hr
              </span>
              <span className="capitalize text-gray-500">{offer.status}</span>
            </div>
            {offer.message && <p className="mt-1 text-gray-700">{offer.message}</p>}
            <p className="mt-1 text-xs text-gray-400">{formatTime(offer.created_at)}</p>
          </li>
        ))}
      </ol>

      {error && <p className="mt-6 text-red-600">{error}</p>}
      {actions.includes("accept") && (
        <div className="mt-6 rounded-lg border border-gray-200 p-4">
          <p className="font-medium">Your turn to respond</p>

          <div className="mt-3 flex gap-3">
            <button
              onClick={() => runAction("accept", {})}
              disabled={busy}
              className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              Accept
            </button>
            <button
              onClick={() => runAction("reject", {})}
              disabled={busy}
              className="rounded-md border border-red-300 px-4 py-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Reject
            </button>
          </div>

          <div className="mt-4 flex gap-3">
            <input
              type="number"
              min="1"
              placeholder="Your price per hour"
              value={counterRate}
              onChange={(e) => setCounterRate(e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2"
            />
            <button
              onClick={sendCounter}
              disabled={busy}
              className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
            >
              Send counter
            </button>
          </div>
        </div>
      )}

      {order.status === "requested" && !actions.includes("accept") && (
        <p className="mt-6 text-gray-500">Waiting for the other person to respond.</p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {actions.includes("start") && (
          <button
            onClick={() => runAction("start", {})}
            disabled={busy}
            className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Confirm handover
          </button>
        )}
        {actions.includes("return") && (
          <button
            onClick={() => runAction("return", {})}
            disabled={busy}
            className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Mark as returned
          </button>
        )}
        {actions.includes("complete") && (
          <button
            onClick={() => runAction("complete", {})}
            disabled={busy}
            className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Complete (item OK)
          </button>
        )}
        {actions.includes("dispute") && (
          <button
            onClick={() => runAction("dispute", {})}
            disabled={busy}
            className="rounded-md border border-red-300 px-4 py-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Report damage
          </button>
        )}
        {actions.includes("cancel") && (
          <button
            onClick={() => runAction("cancel", {})}
            disabled={busy}
            className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel order
          </button>
        )}
      </div>
    </main>
  );
}
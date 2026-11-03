"use client";

import { useEffect, useState } from "react";

import OrderCard from "@/components/orders/OrderCard";
import { apiGet } from "@/lib/api";
import type { Order } from "@/types/order";

export default function DisputesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet<Order[]>("/orders/?status=disputed");
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load disputes.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">Disputed orders</h1>

      {loading && <p className="mt-6 text-gray-500">Loading...</p>}
      {error && <p className="mt-6 text-red-600">{error}</p>}
      {!loading && !error && orders.length === 0 && (
        <p className="mt-6 text-gray-500">No open disputes.</p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </main>
  );
}
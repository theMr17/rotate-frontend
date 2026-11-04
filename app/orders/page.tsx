"use client";

import { useEffect, useState } from "react";
import OrderCard from "@/components/orders/OrderCard";
import { apiGet } from "@/lib/api";
import type { Order } from "@/types/order";
import Link from "next/link";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet<Order[]>("/orders/");
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }
    async function loadRole() {
      try {
        const profile = await apiGet<{ role: string }>("/user/profile");
        setIsAdmin(profile.role === "admin");
      } catch {
        setIsAdmin(false);
      }
    }
    load();
    loadRole();
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Orders</h1>
        {isAdmin && (
          <Link
            href="/orders/disputes"
            className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            Open disputes
          </Link>
        )}
      </div>

      {loading && <p className="mt-6 text-gray-500">Loading your orders...</p>}

      {error && <p className="mt-6 text-red-600">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <p className="mt-6 text-gray-500">You have no orders yet.</p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </main>
  );
}
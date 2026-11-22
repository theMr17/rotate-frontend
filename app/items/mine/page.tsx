"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiDelete, apiGet, apiPatch } from "@/lib/api";
import type { Item } from "@/types/item";

export default function MyListingsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setItems(await apiGet<Item[]>("/items/?mine=true"));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load your listings.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function toggleStatus(item: Item) {
    setBusyId(item.id);
    setError(null);
    try {
      const updated = await apiPatch<Item>(`/items/${item.id}/`, {
        status: item.status === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE",
      });
      setItems((current) => current.map((i) => (i.id === updated.id ? updated : i)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the listing.");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteItem(item: Item) {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    setBusyId(item.id);
    setError(null);
    try {
      await apiDelete(`/items/${item.id}/`);
      setItems((current) => current.filter((i) => i.id !== item.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the listing.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Listings</h1>
        <Link
          href="/items/new"
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700"
        >
          List an item
        </Link>
      </div>

      {loading && <p className="mt-6 text-gray-500">Loading your listings...</p>}
      {error && <p className="mt-6 text-red-600">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <p className="mt-6 text-gray-500">You have not listed any items yet.</p>
      )}

      <ul className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
        {items.map((item) => (
          <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <Link href={`/items/${item.id}`} className="font-medium hover:underline">
                {item.title}
              </Link>
              <p className="text-sm text-gray-500">
                {item.category} . Rs {item.hourly_rate}/hr .{" "}
                <span className={item.status === "AVAILABLE" ? "text-emerald-700" : "text-red-600"}>
                  {item.status === "AVAILABLE" ? "Available" : "Unavailable"}
                </span>
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => toggleStatus(item)}
                disabled={busyId === item.id}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                {item.status === "AVAILABLE" ? "Mark unavailable" : "Mark available"}
              </button>
              <button
                onClick={() => deleteItem(item)}
                disabled={busyId === item.id}
                className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}

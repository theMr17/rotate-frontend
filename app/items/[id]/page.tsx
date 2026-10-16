"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import type { Item } from "@/types/item";

export default function ItemDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadItem() {
      setLoading(true);
      setError(null);

      try {
        const data = await apiGet<Item>(`/items/${id}/`);
        setItem(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not load this item.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadItem();
  }, [id]);

  const hourlyRate = item
    ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }).format(Number(item.hourly_rate))
    : "";

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12">
        <p className="text-gray-500">Loading item details...</p>
      </main>
    );
  }

  if (error || !item) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12">
        <p className="font-medium text-red-600">
          {error || "Item not found."}
        </p>
        <Link
          href="/items"
          className="mt-4 inline-block font-medium text-emerald-700 hover:underline"
        >
          ← Back to items
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <Link
        href="/items"
        className="text-sm font-medium text-emerald-700 hover:underline"
      >
        ← Back to items
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div className="flex min-h-72 items-center justify-center rounded-xl bg-emerald-50">
          <span className="text-8xl" aria-hidden="true">
            📦
          </span>
        </div>

        <section>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
              {item.category}
            </span>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
              {item.condition.replace("_", " ")}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
            {item.title}
          </h1>

          <p className="mt-4 whitespace-pre-wrap leading-7 text-gray-600">
            {item.description || "No description provided."}
          </p>

          <div className="mt-6 rounded-xl border border-gray-200 p-5">
            <p className="text-2xl font-bold text-gray-900">
              {hourlyRate}
              <span className="text-base font-normal text-gray-500">
                {" "}
                / hour
              </span>
            </p>

            <div className="mt-4 flex justify-between border-t border-gray-100 pt-4 text-sm">
              <span className="text-gray-500">Security deposit</span>
              <span className="font-semibold text-gray-900">
                ₹{Number(item.deposit_amount).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="mt-3 flex justify-between text-sm">
              <span className="text-gray-500">Availability</span>
              <span
                className={
                  item.status === "AVAILABLE"
                    ? "font-medium text-emerald-700"
                    : "font-medium text-red-600"
                }
              >
                {item.status === "AVAILABLE" ? "Available" : "Unavailable"}
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
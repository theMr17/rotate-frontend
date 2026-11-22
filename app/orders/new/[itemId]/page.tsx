"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import RentalRequestForm from "@/components/orders/RentalRequestForm";
import { apiGet } from "@/lib/api";
import type { Item } from "@/types/item";

export default function NewOrderPage() {
  const params = useParams<{ itemId: string }>();
  const itemId = params.itemId;
  const [item, setItem] = useState<Item | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadItem() {
      try {
        const data = await apiGet<Item>(`/items/${itemId}/`);
        setItem(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load this item.");
      }
    }
    loadItem();
  }, [itemId]);

  if (!item) {
    return (
      <main className="mx-auto max-w-xl px-4 py-8">
        <p className={error ? "text-red-600" : "text-gray-500"}>{error ?? "Loading item..."}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <Link href={`/items/${item.id}`} className="text-sm text-emerald-700 hover:underline">
        Back to item
      </Link>
      <h1 className="mt-4 text-2xl font-bold">{item.title}</h1>
      <p className="mt-1 text-gray-500">
        Listed at Rs {item.hourly_rate}/hour - Deposit Rs {item.deposit_amount}
      </p>

      {item.status === "AVAILABLE" ? (
        <RentalRequestForm itemId={item.id} hourlyRate={item.hourly_rate} />
      ) : (
        <p className="mt-6 text-red-600">This item is not available right now.</p>
      )}
    </main>
  );
}
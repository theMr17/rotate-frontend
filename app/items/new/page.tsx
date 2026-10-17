"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiPost } from "@/lib/api";
import type { CreateItemPayload, Item } from "@/types/item";

const categories = [
  "Electronics",
  "Tools",
  "Home",
  "Sports",
  "Furniture",
  "Other",
];

export default function NewItemPage() {
  const router = useRouter();

  const [form, setForm] = useState<CreateItemPayload>({
    title: "",
    description: "",
    category: "Other",
    hourly_rate: "",
    deposit_amount: "0.00",
    condition: "GOOD",
    status: "AVAILABLE",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateText(
    field:
      | "title"
      | "description"
      | "category"
      | "hourly_rate"
      | "deposit_amount",
    value: string,
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const createdItem = await apiPost<Item>("/items/", {
        ...form,
        hourly_rate: Number(form.hourly_rate).toFixed(2),
        deposit_amount: Number(form.deposit_amount || 0).toFixed(2),
        status: "AVAILABLE",
      });

      router.push(`/items/${createdItem.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not create the item. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

  const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <Link
        href="/items"
        className="text-sm font-medium text-emerald-700 hover:underline"
      >
        Back to items
      </Link>

      <div className="mt-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          Share with your community
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
          List an item
        </h1>

        <p className="mt-2 text-gray-500">
          Add the details below to make your item available for rent.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7"
      >
        <div>
          <label htmlFor="title" className={labelClass}>
            Item name
          </label>
          <input
            id="title"
            required
            maxLength={200}
            value={form.title}
            onChange={(event) => updateText("title", event.target.value)}
            placeholder="e.g. Cordless power drill"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            value={form.description}
            onChange={(event) =>
              updateText("description", event.target.value)
            }
            placeholder="Describe the item, its features, and what's included."
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="category" className={labelClass}>
            Category
          </label>
          <select
            id="category"
            required
            value={form.category}
            onChange={(event) => updateText("category", event.target.value)}
            className={inputClass}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="hourly_rate" className={labelClass}>
              Rental rate (₹ per hour)
            </label>
            <input
              id="hourly_rate"
              type="number"
              required
              min="0.01"
              step="0.01"
              value={form.hourly_rate}
              onChange={(event) =>
                updateText("hourly_rate", event.target.value)
              }
              placeholder="100.00"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="deposit_amount" className={labelClass}>
              Security deposit (₹)
            </label>
            <input
              id="deposit_amount"
              type="number"
              required
              min="0"
              step="0.01"
              value={form.deposit_amount}
              onChange={(event) =>
                updateText("deposit_amount", event.target.value)
              }
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="condition" className={labelClass}>
            Item condition
          </label>
          <select
            id="condition"
            value={form.condition}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                condition: event.target.value as Item["condition"],
              }))
            }
            className={inputClass}
          >
            <option value="NEW">New</option>
            <option value="GOOD">Good</option>
            <option value="FAIR">Fair</option>
            <option value="POOR">Poor</option>
          </select>
        </div>

        <div className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Your listing will be created with status <strong>Available</strong>.
          Your account will automatically be set as the owner.
        </div>

        {error && (
          <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-emerald-600 px-4 py-3 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating listing..." : "Publish listing"}
        </button>
      </form>
    </main>
  );
}
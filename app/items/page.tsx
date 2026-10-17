"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import ItemCard from "@/components/items/ItemCard";
import { apiGet } from "@/lib/api";
import type { Item } from "@/types/item";

const categories = [
  "Electronics",
  "Tools",
  "Home",
  "Sports",
  "Furniture",
  "Other",
];

export default function BrowsePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(
    async (searchTerm: string, categoryValue: string) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();

        if (searchTerm.trim()) {
          params.set("search", searchTerm.trim());
        }

        if (categoryValue) {
          params.set("category", categoryValue);
        }

        const query = params.toString();
        const endpoint = query ? `/items/?${query}` : "/items/";

        const data = await apiGet<Item[]>(endpoint);
        setItems(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not load items.",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadItems("", "");
    }, 0);

    return () => clearTimeout(timer);
  }, [loadItems]);

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadItems(search, category);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
            The Rotate marketplace
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            Find something to rent
          </h1>

          <p className="mt-2 text-gray-500">
            Discover useful items available from other people.
          </p>
        </div>

        <Link
          href="/items/new"
          className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-700"
        >
          + List an item
        </Link>
      </div>

      <form
        onSubmit={handleSearch}
        className="mt-8 grid gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_220px_auto]"
      >
        <div>
          <label
            htmlFor="item-search"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Search items
          </label>

          <input
            id="item-search"
            type="search"
            placeholder="Try camera, drill, bicycle..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <div>
          <label
            htmlFor="item-category"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Category
          </label>

          <select
            id="item-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="">All categories</option>
            {categories.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-emerald-600 px-5 py-2.5 font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60 sm:w-auto"
          >
            Search
          </button>
        </div>
      </form>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Available items
        </h2>

        {!loading && !error && (
          <p className="text-sm text-gray-500">
            {items.length} {items.length === 1 ? "item" : "items"} found
          </p>
        )}
      </div>

      {loading && (
        <p className="mt-6 text-gray-500">Loading items...</p>
      )}

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="font-medium text-red-700">Could not load items</p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => void loadItems(search, category)}
            className="mt-3 text-sm font-medium text-red-700 underline"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-gray-300 px-6 py-12 text-center">
          <p className="text-lg font-semibold text-gray-900">
            No items found
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Try another search or choose a different category.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategory("");
              void loadItems("", "");
            }}
            className="mt-4 font-medium text-emerald-700 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </main>
  );
}
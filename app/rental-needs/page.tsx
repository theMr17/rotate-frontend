"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import RentalNeedCard from "@/components/rental-needs/RentalNeedCard";
import { getRentalNeeds } from "@/lib/rental-needs-api";

import type { RentalNeed } from "@/types/rental-need";


const categories = [
  "Electronics",
  "Tools",
  "Home",
  "Sports",
  "Furniture",
  "Other",
];


export default function RentalNeedsPage() {

  const [needs, setNeeds] = useState<RentalNeed[]>([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");

  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    category: "",
    location: "",
  });

  const [mode, setMode] = useState<"browse" | "mine">("browse");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const loadNeeds = useCallback(async () => {

    setLoading(true);
    setError(null);

    try {

      const data = await getRentalNeeds({
        ...appliedFilters,
        mine: mode === "mine",
      });

      setNeeds(data);

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Could not load rental requests.",
      );

    } finally {

      setLoading(false);

    }

  }, [appliedFilters, mode]);


  // Load requests whenever the selected filters or tab changes.
  useEffect(() => {

    const timer = setTimeout(() => {
      void loadNeeds();
    }, 0);

    return () => clearTimeout(timer);

  }, [loadNeeds]);


  function handleSearch(
    event: React.FormEvent<HTMLFormElement>,
  ) {

    event.preventDefault();

    setAppliedFilters({
      search,
      category,
      location,
    });

  }


  function clearFilters() {

    setSearch("");
    setCategory("");
    setLocation("");

    setAppliedFilters({
      search: "",
      category: "",
      location: "",
    });

  }


  return (

    <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">

      {/* Heading */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

        <div>

          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
            The Rotate community
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            Rental requests
          </h1>

          <p className="mt-2 text-gray-500">
            Find people looking for items you can offer.
          </p>

        </div>

        <Link
          href="/rental-needs/new"
          className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-700"
        >
          + Post a requirement
        </Link>

      </div>


      {/* Browse / My requests tabs */}

      <div className="mt-8 flex gap-3 border-b border-gray-200">

        <button
          type="button"
          onClick={() => setMode("browse")}
          className={`border-b-2 px-4 py-3 text-sm font-medium ${
            mode === "browse"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          Browse requests
        </button>

        <button
          type="button"
          onClick={() => setMode("mine")}
          className={`border-b-2 px-4 py-3 text-sm font-medium ${
            mode === "mine"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          My requests
        </button>

      </div>


      {/* Filters */}

      <form
        onSubmit={handleSearch}
        className="mt-6 grid gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[1fr_180px_200px_auto]"
      >

        <div>

          <label
            htmlFor="need-search"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Search
          </label>

          <input
            id="need-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Camera, bicycle, laptop..."
            className="w-full rounded-md border border-gray-300 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />

        </div>


        <div>

          <label
            htmlFor="need-category"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Category
          </label>

          <select
            id="need-category"
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


        <div>

          <label
            htmlFor="need-location"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Location
          </label>

          <input
            id="need-location"
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Mumbai, Powai..."
            className="w-full rounded-md border border-gray-300 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />

        </div>


        <div className="flex items-end">

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-emerald-600 px-5 py-2.5 font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            Search
          </button>

        </div>

      </form>


      {/* Results heading */}

      <div className="mt-8 flex items-center justify-between">

        <h2 className="text-lg font-semibold text-gray-900">
          {mode === "browse" ? "Open requests" : "Your requests"}
        </h2>

        {!loading && !error && (
          <p className="text-sm text-gray-500">
            {needs.length} {needs.length === 1 ? "request" : "requests"} found
          </p>
        )}

      </div>


      {/* Loading */}

      {loading && (
        <p className="mt-6 text-gray-500">
          Loading rental requests...
        </p>
      )}


      {/* Error */}

      {error && (

        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">

          <p className="font-medium text-red-700">
            Could not load rental requests
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() => void loadNeeds()}
            className="mt-3 text-sm font-medium text-red-700 underline"
          >
            Try again
          </button>

        </div>

      )}


      {/* Empty state */}

      {!loading && !error && needs.length === 0 && (

        <div className="mt-6 rounded-xl border border-dashed border-gray-300 px-6 py-12 text-center">

          <p className="text-lg font-semibold text-gray-900">
            {mode === "browse"
              ? "No rental requests found"
              : "You haven't posted any requests yet"}
          </p>

          <p className="mt-2 text-sm text-gray-500">
            {mode === "browse"
              ? "Try changing your filters or check again later."
              : "Post a requirement and let other users offer their items."}
          </p>

          {mode === "mine" && (

            <Link
              href="/rental-needs/new"
              className="mt-4 inline-block font-medium text-emerald-700 hover:underline"
            >
              Post your first request
            </Link>

          )}

          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 block w-full text-sm font-medium text-gray-500 hover:text-gray-800"
          >
            Clear filters
          </button>

        </div>

      )}


      {/* Request cards */}

      {!loading && !error && needs.length > 0 && (

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {needs.map((need) => (
            <RentalNeedCard
              key={need.id}
              need={need}
            />
          ))}

        </div>

      )}

    </main>

  );

}
"use client";

import Link from "next/link";
import { useState } from "react";

import { createRentalNeed } from "@/lib/rental-needs-api";

import type {
  CreateRentalNeedPayload,
  RentalNeed,
} from "@/types/rental-need";

const categories = [
  "Electronics",
  "Tools",
  "Home",
  "Sports",
  "Furniture",
  "Other",
];

export default function NewRentalNeedPage() {
  const [form, setForm] = useState<CreateRentalNeedPayload>({
    title: "",
    description: "",
    category: "Other",
    start_time: "",
    end_time: "",
    location: "",
    budget_per_hour: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdNeed, setCreatedNeed] = useState<RentalNeed | null>(null);

  function updateField(
    field: keyof CreateRentalNeedPayload,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);

    // Validate rental dates before sending the request.
    const startDate = new Date(form.start_time);
    const endDate = new Date(form.end_time);

    if (startDate <= new Date()) {
      setError("The rental start date must be in the future.");
      return;
    }

    if (endDate <= startDate) {
      setError("The end date must be after the start date.");
      return;
    }

    setLoading(true);

    try {
      const payload: CreateRentalNeedPayload = {
        ...form,

        // Convert local browser time to ISO UTC timestamps.
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),

        // An empty budget means the user is flexible.
        budget_per_hour: form.budget_per_hour?.trim()
          ? Number(form.budget_per_hour).toFixed(2)
          : null,
      };

      const need = await createRentalNeed(payload);

      setCreatedNeed(need);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not post your requirement. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

  const labelClass =
    "mb-1.5 block text-sm font-medium text-gray-700";

  // Display success after the backend creates the request.
  if (createdNeed) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12">

        <div className="rounded-xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            Requirement posted successfully
          </h1>

          <p className="mt-3 text-gray-600">
            Your request, <strong>{createdNeed.title}</strong>, is now
            available for other users to respond to.
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Request ID: #{createdNeed.id}
          </p>

          <Link
            href="/rental-needs"
            className="mt-7 inline-block rounded-md bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700"
          >
            Go to Rental Requests
          </Link>

          <p className="mt-3 text-xs text-gray-500">
            Select the My Requests tab to see your newly posted request.
          </p>

        </div>

      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">

      {/* Back navigation */}

      <Link
        href="/rental-needs"
        className="text-sm font-medium text-emerald-700 hover:underline"
      >
        Back to rental requests
      </Link>

      {/* Heading */}

      <div className="mt-5">

        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          Find what you need
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
          Post a rental requirement
        </h1>

        <p className="mt-2 text-gray-500">
          Describe the item you need, when you need it, and where.
          Other users can respond with their rental offers.
        </p>

      </div>

      {/* Form */}

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7"
      >

        {/* Title */}

        <div>

          <label htmlFor="title" className={labelClass}>
            What item do you need?
          </label>

          <input
            id="title"
            type="text"
            required
            maxLength={200}
            value={form.title}
            onChange={(event) =>
              updateField("title", event.target.value)
            }
            placeholder="e.g. DSLR camera, bicycle, projector"
            className={inputClass}
          />

        </div>

        {/* Description */}

        <div>

          <label htmlFor="description" className={labelClass}>
            Description
          </label>

          <textarea
            id="description"
            rows={4}
            value={form.description}
            onChange={(event) =>
              updateField("description", event.target.value)
            }
            placeholder="Mention specifications, features, accessories or any other requirements."
            className={inputClass}
          />

        </div>

        {/* Category */}

        <div>

          <label htmlFor="category" className={labelClass}>
            Category
          </label>

          <select
            id="category"
            required
            value={form.category}
            onChange={(event) =>
              updateField("category", event.target.value)
            }
            className={inputClass}
          >

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}

          </select>

        </div>

        {/* Rental duration */}

        <div>

          <h2 className="mb-3 text-base font-semibold text-gray-900">
            When do you need it?
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">

            <div>

              <label htmlFor="start_time" className={labelClass}>
                Required from
              </label>

              <input
                id="start_time"
                type="datetime-local"
                required
                value={form.start_time}
                onChange={(event) =>
                  updateField("start_time", event.target.value)
                }
                className={inputClass}
              />

            </div>

            <div>

              <label htmlFor="end_time" className={labelClass}>
                Required until
              </label>

              <input
                id="end_time"
                type="datetime-local"
                required
                value={form.end_time}
                min={form.start_time || undefined}
                onChange={(event) =>
                  updateField("end_time", event.target.value)
                }
                className={inputClass}
              />

            </div>

          </div>

          <p className="mt-2 text-xs text-gray-500">
            Select the complete period during which you need the item.
          </p>

        </div>

        {/* Location */}

        <div>

          <label htmlFor="location" className={labelClass}>
            Where do you need the item?
          </label>

          <input
            id="location"
            type="text"
            required
            maxLength={255}
            value={form.location}
            onChange={(event) =>
              updateField("location", event.target.value)
            }
            placeholder="e.g. Powai, Mumbai"
            className={inputClass}
          />

        </div>

        {/* Budget */}

        <div>

          <label htmlFor="budget" className={labelClass}>
            Maximum budget (Rs per hour)
          </label>

          <input
            id="budget"
            type="number"
            min="0.01"
            step="0.01"
            value={form.budget_per_hour ?? ""}
            onChange={(event) =>
              updateField("budget_per_hour", event.target.value)
            }
            placeholder="e.g. 100"
            className={inputClass}
          />

          <p className="mt-1.5 text-xs text-gray-500">
            Optional. Leave blank if your budget is flexible.
          </p>

        </div>

        {/* Information */}

        <div className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-800">

          Your requirement will be visible to other Rotate users.
          They can respond with their available items and proposed
          rental rates.

        </div>

        {/* Error */}

        {error && (
          <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Submit */}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-emerald-600 px-4 py-3 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Posting requirement..."
            : "Post requirement"}
        </button>

      </form>

    </main>
  );
}
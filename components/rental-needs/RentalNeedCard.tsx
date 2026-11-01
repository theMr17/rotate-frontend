import Link from "next/link";
import type { RentalNeed } from "@/types/rental-need";

type RentalNeedCardProps = {
  need: RentalNeed;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatBudget(budget: string | null) {
  if (!budget) return "Flexible budget";

  return `₹${Number(budget).toLocaleString("en-IN")}/hour`;
}

export default function RentalNeedCard({
  need,
}: RentalNeedCardProps) {

  return (
    <article className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md">

      {/* Category and request ID */}
      <div className="flex items-start justify-between gap-3">

        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          {need.category}
        </span>

        <span className="text-xs text-gray-400">
          Request #{need.id}
        </span>

      </div>

      {/* Title and description */}
      <h2 className="mt-4 text-lg font-semibold text-gray-900">
        {need.title}
      </h2>

      <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">
        {need.description || "No additional description provided."}
      </p>

      {/* Request information */}
      <div className="mt-5 space-y-3 border-t border-gray-100 pt-4">

        <div className="flex items-start gap-2 text-sm">
          <span>📍</span>
          <span className="text-gray-700">
            {need.location}
          </span>
        </div>

        <div className="flex items-start gap-2 text-sm">
          <span>📅</span>

          <div className="text-gray-700">
            <p>{formatDate(need.start_time)}</p>
            <p className="mt-1 text-gray-500">
              to {formatDate(need.end_time)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 text-sm">

          <span className="text-gray-500">
            Posted by {need.requester_name}
          </span>

          <span className="font-semibold text-emerald-700">
            {formatBudget(need.budget_per_hour)}
          </span>

        </div>

      </div>

      {/* Footer */}
      <Link
        href={`/rental-needs/${need.id}`}
        className="mt-5 rounded-md border border-emerald-600 px-4 py-2.5 text-center text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
      >
        View request →
      </Link>

    </article>
  );
}
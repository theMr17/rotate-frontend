import Link from "next/link";
import type { Item } from "@/types/item";

type ItemCardProps = {
  item: Item;
};

export default function ItemCard({ item }: ItemCardProps) {
  const hourlyRate = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(item.hourly_rate));

  return (
    <Link
      href={`/items/${item.id}`}
      className="group block overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md"
    >
      <div className="flex h-36 items-center justify-center bg-emerald-50">
        <span className="text-5xl" aria-hidden="true">
          📦
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-semibold text-gray-900 group-hover:text-emerald-700">
            {item.title}
          </h2>

          <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            {item.status === "AVAILABLE" ? "Available" : "Unavailable"}
          </span>
        </div>

        <p className="mt-2 text-sm text-gray-500">
          {item.category} · {item.condition.replace("_", " ")}
        </p>

        <p className="mt-3 line-clamp-2 text-sm text-gray-600">
          {item.description || "No description provided."}
        </p>

        <div className="mt-5 flex items-end justify-between border-t border-gray-100 pt-4">
          <div>
            <p className="text-lg font-bold text-gray-900">
              {hourlyRate}
              <span className="text-sm font-normal text-gray-500">/hour</span>
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Deposit: ₹{Number(item.deposit_amount).toLocaleString("en-IN")}
            </p>
          </div>

          <span className="text-sm font-medium text-emerald-700">
            View details →
          </span>
        </div>
      </div>
    </Link>
  );
}
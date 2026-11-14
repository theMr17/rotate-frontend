import type { RatingStat, ReliabilityLevel, Trust } from "@/types/trust";

const LEVELS: Record<ReliabilityLevel, { label: string; className: string }> = {
  new: { label: "New member", className: "bg-gray-100 text-gray-700" },
  excellent: { label: "Excellent", className: "bg-emerald-100 text-emerald-800" },
  good: { label: "Good", className: "bg-sky-100 text-sky-800" },
  fair: { label: "Fair", className: "bg-amber-100 text-amber-800" },
  poor: { label: "Poor", className: "bg-red-100 text-red-700" },
};

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

function isNewMember(reliability: Trust["reliability"]) {
  return reliability.score === null || reliability.level === "new";
}

function reliabilityBreakdown(reliability: Trust["reliability"]) {
  if (isNewMember(reliability)) return "Not enough rental history yet.";
  const parts = [`${reliability.on_time_returns} of ${reliability.rentals_counted} returns on time`];
  if (reliability.late_returns) parts.push(plural(reliability.late_returns, "late return"));
  if (reliability.late_cancellations) parts.push(plural(reliability.late_cancellations, "late cancellation"));
  return parts.join(" · ");
}

function Rating({ stat, compact = false }: { stat: RatingStat; compact?: boolean }) {
  if (stat.average === null) return <span className="text-gray-500">No reviews yet</span>;
  return (
    <span className="whitespace-nowrap">
      <span className="text-amber-500" aria-hidden="true">
        ★
      </span>{" "}
      <span className="font-semibold tabular-nums text-gray-900">{stat.average.toFixed(1)}</span>{" "}
      <span className="text-gray-500">({compact ? stat.count : plural(stat.count, "review")})</span>
    </span>
  );
}

function ReliabilityBadge({ reliability, withScore }: { reliability: Trust["reliability"]; withScore: boolean }) {
  const isNew = isNewMember(reliability);
  const level = isNew ? LEVELS.new : LEVELS[reliability.level];
  const text = isNew ? level.label : withScore ? `Reliability ${reliability.score} · ${level.label}` : level.label;

  return (
    <span
      title={reliabilityBreakdown(reliability)}
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${level.className}`}
    >
      {text}
    </span>
  );
}

type TrustBadgesProps = {
  trust: Trust;
  compact?: boolean;
};

export default function TrustBadges({ trust, compact = false }: TrustBadgesProps) {
  const { rating, reliability } = trust;

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <Rating stat={rating} compact />
        <ReliabilityBadge reliability={reliability} withScore />
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-lg border border-gray-200 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Rating</p>
        <p className="mt-2 text-lg">
          <Rating stat={rating} />
        </p>
        <dl className="mt-3 space-y-1.5 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-gray-500">As lender</dt>
            <dd>
              <Rating stat={rating.as_lender} compact />
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-gray-500">As borrower</dt>
            <dd>
              <Rating stat={rating.as_borrower} compact />
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border border-gray-200 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Reliability</p>
        <div className="mt-2 flex items-center gap-3">
          {!isNewMember(reliability) && (
            <span className="text-2xl font-bold tabular-nums text-gray-900">{reliability.score}</span>
          )}
          <ReliabilityBadge reliability={reliability} withScore={false} />
        </div>
        <p className="mt-3 text-sm text-gray-600">{reliabilityBreakdown(reliability)}</p>
      </div>
    </div>
  );
}

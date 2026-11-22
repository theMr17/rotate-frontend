import Link from "next/link";
import Avatar from "@/components/Avatar";
import { Stars } from "@/components/trust/Stars";
import type { Review } from "@/types/trust";

type ReviewCardProps = {
  review: Review;
  showRole?: boolean;
};

export default function ReviewCard({ review, showRole = true }: ReviewCardProps) {
  const { reviewer } = review;
  const date = new Date(review.created_at);

  return (
    <article className="flex gap-3">
      <Link href={`/users/${reviewer.id}`} className="shrink-0">
        <Avatar name={reviewer.name} photoUrl={reviewer.profile_photo_url} size={40} decorative />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <Link href={`/users/${reviewer.id}`} className="font-medium text-gray-900 hover:underline">
            {reviewer.name}
          </Link>
          <time dateTime={review.created_at} className="text-xs text-gray-500">
            {date.toLocaleDateString("en-IN", { dateStyle: "medium" })}
          </time>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-gray-500">
          <Stars rating={review.rating} className="text-sm" />
          {showRole && <span>As {review.reviewee_role}</span>}
        </div>
        {review.comment && <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{review.comment}</p>}
      </div>
    </article>
  );
}

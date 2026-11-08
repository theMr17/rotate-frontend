export type RatingStat = {
  average: number | null;
  count: number;
};

export type ReliabilityLevel = "new" | "excellent" | "good" | "fair" | "poor";

export type Trust = {
  rating: RatingStat & { as_lender: RatingStat; as_borrower: RatingStat };
  reliability: {
    score: number | null;
    level: ReliabilityLevel;
    rentals_counted: number;
    on_time_returns: number;
    late_returns: number;
    late_cancellations: number;
  };
};

export type ReviewRole = "lender" | "borrower";

export type Review = {
  id: number;
  order: number;
  reviewer: { id: number; name: string; profile_photo_url: string };
  reviewee_role: ReviewRole;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  created_at: string;
};

export type OrderReviewStatus = {
  can_review: boolean;
  reason: string | null;
  my_review: Review | null;
  their_review: Review | null;
};

export type CreateReviewPayload = {
  order: number;
  rating: number;
  comment?: string;
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

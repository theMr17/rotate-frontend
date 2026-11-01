export type RentalNeedStatus =
  | "open"
  | "fulfilled"
  | "cancelled";

export type OrderStatus =
  | "requested"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "active"
  | "returned"
  | "disputed"
  | "completed";

export type OfferStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "countered";

export type RentalNeed = {
  id: number;
  requester: number;
  requester_name: string;

  title: string;
  description: string;
  category: string;

  start_time: string;
  end_time: string;

  location: string;
  budget_per_hour: string | null;

  status: RentalNeedStatus;
  fulfilled_order: number | null;

  created_at: string;
  updated_at: string;
};

export type CreateRentalNeedPayload = {
  title: string;
  description: string;
  category: string;
  start_time: string;
  end_time: string;
  location: string;
  budget_per_hour: string | null;
};

export type RespondToRentalNeedPayload = {
  item: number;
  hourly_rate: string;
  message: string;
};

export type RentalNeedParticipant = {
  id: number;
  name: string;
  avatar: string | null;
  reliability_score: number | null;

  contact: {
    email: string;
    phone: string;
    location: string;
  } | null;
};

export type RentalNeedOffer = {
  id: number;
  proposed_by: number;
  hourly_rate: string;
  message: string;
  status: OfferStatus;
  created_at: string;
};

export type RentalNeedOrder = {
  id: number;
  booking_ref: string;

  item: {
    id: number;
    title: string;
    cover_photo: string | null;
    owner: number;
  };

  borrower: RentalNeedParticipant;
  lender: RentalNeedParticipant;

  my_role: "borrower" | "lender" | null;
  allowed_actions: string[];

  start_time: string;
  end_time: string;

  status: OrderStatus;

  agreed_hourly_rate: string | null;
  rental_fee: string | null;
  platform_fee: string | null;
  deposit_amount: string;
  total_due: string | null;

  offers: RentalNeedOffer[];

  started_at: string | null;
  returned_at: string | null;
  completed_at: string | null;
  cancelled_by: number | null;

  created_at: string;
  updated_at: string;
};

export type RentalNeedResponse = {
  id: number;
  provider: number;
  provider_name: string;
  order: RentalNeedOrder;
  created_at: string;
};

export type RentalNeedDetail = RentalNeed & {
  responses: RentalNeedResponse[];
};
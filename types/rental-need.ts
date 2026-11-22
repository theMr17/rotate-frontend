
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

export type RentalNeedOffer = {
  id: number;
  proposed_by: string;
  hourly_rate: string;
  message: string;
  status: OfferStatus;
  created_at: string;
};

export type RentalNeedOrder = {
  id: number;
  item: number;
  item_title: string;

  borrower: string;
  lender: string;

  start_time: string;
  end_time: string;

  status: OrderStatus;

  agreed_hourly_rate: string | null;
  deposit_amount: string;

  offers: RentalNeedOffer[];

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

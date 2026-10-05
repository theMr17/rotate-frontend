export type OrderStatus =
  | "requested"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "active"
  | "returned"
  | "disputed"
  | "completed";

export type OfferStatus = "pending" | "accepted" | "rejected" | "countered";

export type Offer = {
  id: number;
  proposed_by: string;
  hourly_rate: string;
  message: string;
  status: OfferStatus;
  created_at: string;
};

export type Order = {
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
  offers: Offer[];
  created_at: string;
  updated_at: string;
};
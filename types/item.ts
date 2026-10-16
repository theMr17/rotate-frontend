export type Item = {
  id: number;
  owner: number;
  title: string;
  description: string;
  category: string;
  hourly_rate: string;
  deposit_amount: string;
  condition: "NEW" | "GOOD" | "FAIR" | "POOR";
  status: "AVAILABLE" | "UNAVAILABLE";
  created_at?: string;
  updated_at?: string;
};

export type CreateItemPayload = {
  title: string;
  description: string;
  category: string;
  hourly_rate: string;
  deposit_amount: string;
  condition: Item["condition"];
  status: Item["status"];
};
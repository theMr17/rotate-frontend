import { apiGet, apiPost } from "@/lib/api";

import type {
  RentalNeed,
  RentalNeedDetail,
  CreateRentalNeedPayload,
  RespondToRentalNeedPayload,
  RentalNeedResponse,
} from "@/types/rental-need";


export type RentalNeedFilters = {
  search?: string;
  category?: string;
  location?: string;
  mine?: boolean;
};


// Browse requests or fetch your own requests.
export async function getRentalNeeds(
  filters: RentalNeedFilters = {},
): Promise<RentalNeed[]> {

  const params = new URLSearchParams();

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  if (filters.category) {
    params.set("category", filters.category);
  }

  if (filters.location?.trim()) {
    params.set("location", filters.location.trim());
  }

  if (filters.mine) {
    params.set("mine", "true");
  }

  const query = params.toString();

  const endpoint = query
    ? `/rental-needs/?${query}`
    : "/rental-needs/";

  return apiGet<RentalNeed[]>(endpoint);
}


// Fetch one request along with all provider responses.
export async function getRentalNeed(
  id: number,
): Promise<RentalNeedDetail> {

  return apiGet<RentalNeedDetail>(
    `/rental-needs/${id}/`
  );
}


// Create a new rental requirement.
export async function createRentalNeed(
  payload: CreateRentalNeedPayload,
): Promise<RentalNeed> {

  return apiPost<RentalNeed>(
    "/rental-needs/",
    payload
  );
}


// Respond to a rental requirement.
export async function respondToRentalNeed(
  id: number,
  payload: RespondToRentalNeedPayload,
): Promise<RentalNeedResponse> {

  return apiPost<RentalNeedResponse>(
    `/rental-needs/${id}/respond/`,
    payload
  );
}


// Cancel your own requirement.
export async function cancelRentalNeed(
  id: number,
): Promise<RentalNeed> {

  return apiPost<RentalNeed>(
    `/rental-needs/${id}/cancel/`,
    {}
  );
}
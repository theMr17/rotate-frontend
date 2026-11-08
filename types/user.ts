import type { Trust } from "@/types/trust";

export type GeoPoint = {
  lat: number;
  lng: number;
};

export type UserProfile = {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  home_location: GeoPoint | null;
  home_address_label: string;
  profile_photo_url: string;
  role: "user" | "admin";
  is_verified: boolean;
  trust: Trust;
  created_at: string;
  updated_at: string;
};

export type PublicProfile = {
  id: number;
  name: string;
  location: string;
  profile_photo_url: string;
  is_verified: boolean;
  trust: Trust;
  created_at: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  phone: string;
  location: string;
  home_location?: GeoPoint | null;
  home_address_label?: string;
};

export type EditableProfileField = "name" | "phone" | "location" | "home_location" | "home_address_label";

export type UpdateProfilePayload = Partial<Pick<UserProfile, EditableProfileField>>;

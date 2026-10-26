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
  role: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
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

import type { GeoPoint } from "@/types/user";

export const HOME_ADDRESS_LABEL_MAX_LENGTH = 255;

export type HomeLocationDraft = {
  lat: string;
  lng: string;
  label: string;
};

export const EMPTY_HOME_LOCATION: HomeLocationDraft = { lat: "", lng: "", label: "" };

export function toHomeLocationDraft(point: GeoPoint | null, label: string): HomeLocationDraft {
  return {
    lat: point ? String(point.lat) : "",
    lng: point ? String(point.lng) : "",
    label,
  };
}

export type ParsedPoint = { ok: true; point: GeoPoint | null } | { ok: false; error: string };

export function parseHomePoint(draft: Pick<HomeLocationDraft, "lat" | "lng">): ParsedPoint {
  const lat = draft.lat.trim();
  const lng = draft.lng.trim();

  if (!lat && !lng) return { ok: true, point: null };
  if (!lat || !lng) return { ok: false, error: "Enter both latitude and longitude, or leave both empty." };

  const latValue = Number(lat);
  const lngValue = Number(lng);
  if (!Number.isFinite(latValue) || !Number.isFinite(lngValue)) {
    return { ok: false, error: "Latitude and longitude must be numbers." };
  }
  if (latValue < -90 || latValue > 90) return { ok: false, error: "Latitude must be between -90 and 90." };
  if (lngValue < -180 || lngValue > 180) return { ok: false, error: "Longitude must be between -180 and 180." };

  return { ok: true, point: { lat: latValue, lng: lngValue } };
}

export function samePoint(a: GeoPoint | null, b: GeoPoint | null) {
  if (a === null || b === null) return a === b;
  return a.lat === b.lat && a.lng === b.lng;
}

export function formatPoint(point: GeoPoint) {
  return `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`;
}

export function mapUrl(point: GeoPoint) {
  const { lat, lng } = point;
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
}

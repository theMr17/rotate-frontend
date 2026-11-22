"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import Field from "@/components/form/Field";
import {
  HOME_ADDRESS_LABEL_MAX_LENGTH,
  mapUrl,
  parseHomePoint,
  type HomeLocationDraft,
} from "@/lib/homeLocation";

type HomeLocationFieldsProps = {
  idPrefix: string;
  value: HomeLocationDraft;
  onChange: Dispatch<SetStateAction<HomeLocationDraft>>;
  pointError?: string;
  labelError?: string;
  disabled?: boolean;
};

export default function HomeLocationFields({
  idPrefix,
  value,
  onChange,
  pointError,
  labelError,
  disabled,
}: HomeLocationFieldsProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const hasCoordinates = Boolean(value.lat.trim() || value.lng.trim());
  const parsed = parseHomePoint(value);
  const previewPoint = parsed.ok ? parsed.point : null;

  function setField(field: keyof HomeLocationDraft, next: string) {
    onChange((current) => ({ ...current, [field]: next }));
  }

  function fillFromCurrentLocation() {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setGeoError("Your browser can't share its location. Enter the coordinates instead.");
      return;
    }

    setGeoError(null);
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        onChange((current) => ({
          ...current,
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6),
        }));
      },
      (error) => {
        setIsLocating(false);
        setGeoError(
          error.code === error.PERMISSION_DENIED
            ? "Location permission was denied. Enter the coordinates instead."
            : "Couldn't get your location. Enter the coordinates instead.",
        );
      },
      { timeout: 10_000, maximumAge: 60_000 },
    );
  }

  return (
    <fieldset className="space-y-4 rounded-lg border border-gray-200 p-4" disabled={disabled}>
      <legend className="px-1 text-sm font-medium text-gray-700">
        Home location <span className="font-normal text-gray-400">(optional)</span>
      </legend>

      <Field
        id={`${idPrefix}-home-label`}
        label="Area label"
        placeholder="e.g. Powai, Mumbai"
        maxLength={HOME_ADDRESS_LABEL_MAX_LENGTH}
        value={value.label}
        onChange={(event) => setField("label", event.target.value)}
        error={labelError}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id={`${idPrefix}-home-lat`}
          label="Latitude"
          type="number"
          inputMode="decimal"
          step="any"
          min={-90}
          max={90}
          placeholder="19.13"
          value={value.lat}
          onChange={(event) => setField("lat", event.target.value)}
          invalid={Boolean(pointError)}
          aria-describedby={pointError ? `${idPrefix}-home-point-error` : undefined}
        />
        <Field
          id={`${idPrefix}-home-lng`}
          label="Longitude"
          type="number"
          inputMode="decimal"
          step="any"
          min={-180}
          max={180}
          placeholder="72.91"
          value={value.lng}
          onChange={(event) => setField("lng", event.target.value)}
          invalid={Boolean(pointError)}
          aria-describedby={pointError ? `${idPrefix}-home-point-error` : undefined}
        />
      </div>

      {pointError && (
        <p id={`${idPrefix}-home-point-error`} className="-mt-2 text-xs text-red-600">
          {pointError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <button
          type="button"
          onClick={fillFromCurrentLocation}
          disabled={isLocating}
          className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLocating ? "Locating..." : "Use my current location"}
        </button>
        {hasCoordinates && (
          <button
            type="button"
            onClick={() => onChange((current) => ({ ...current, lat: "", lng: "" }))}
            className="font-medium text-gray-600 hover:underline"
          >
            Clear coordinates
          </button>
        )}
        {previewPoint && (
          <a
            href={mapUrl(previewPoint)}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-emerald-700 hover:underline"
          >
            Check on map
          </a>
        )}
      </div>

      {geoError && <p className="text-xs text-red-600">{geoError}</p>}
      <p className="text-xs text-gray-500">
        Coordinates are saved exactly as entered, so a nearby landmark is fine.
      </p>
    </fieldset>
  );
}

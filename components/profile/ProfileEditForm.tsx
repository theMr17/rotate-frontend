"use client";

import { useState } from "react";
import Field from "@/components/form/Field";
import HomeLocationFields from "@/components/form/HomeLocationFields";
import { ApiError, apiPatch } from "@/lib/api";
import { parseHomePoint, samePoint, toHomeLocationDraft } from "@/lib/homeLocation";
import type { EditableProfileField, UpdateProfilePayload, UserProfile } from "@/types/user";

type ProfileEditFormProps = {
  profile: UserProfile;
  onSaved: (profile: UserProfile) => void;
  onCancel: () => void;
};

const EDITABLE_FIELDS: EditableProfileField[] = [
  "name",
  "phone",
  "location",
  "home_location",
  "home_address_label",
];

export default function ProfileEditForm({ profile, onSaved, onCancel }: ProfileEditFormProps) {
  const [form, setForm] = useState({
    name: profile.name,
    phone: profile.phone,
    location: profile.location,
  });
  const [homeLocation, setHomeLocation] = useState(() =>
    toHomeLocationDraft(profile.home_location, profile.home_address_label),
  );
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  const fieldError = (name: EditableProfileField) => fieldErrors[name]?.[0];

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    const parsed = parseHomePoint(homeLocation);
    if (!parsed.ok) {
      setFieldErrors({ home_location: [parsed.error] });
      return;
    }

    const changes: UpdateProfilePayload = {};
    if (form.name !== profile.name) changes.name = form.name;
    if (form.phone !== profile.phone) changes.phone = form.phone;
    if (form.location !== profile.location) changes.location = form.location;
    if (!samePoint(parsed.point, profile.home_location)) changes.home_location = parsed.point;
    const label = homeLocation.label.trim();
    if (label !== profile.home_address_label) changes.home_address_label = label;

    if (Object.keys(changes).length === 0) {
      onCancel();
      return;
    }

    setIsSaving(true);
    try {
      onSaved(await apiPatch<UserProfile>("/user/profile", changes));
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(err.fields);
        const names = Object.keys(err.fields);
        const unshown = names.find((name) => !EDITABLE_FIELDS.includes(name as EditableProfileField));
        setError(unshown ? err.fields[unshown][0] : names.length ? null : err.message);
      } else {
        setError("Unable to save your profile.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <Field
        id="profile-email"
        label="Email address"
        value={profile.email}
        disabled
        hint="Your email can't be changed."
      />

      <Field
        id="profile-name"
        label="Full name"
        required
        value={form.name}
        onChange={(event) => updateField("name", event.target.value)}
        error={fieldError("name")}
        disabled={isSaving}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="profile-phone"
          label="Phone number"
          type="tel"
          required
          value={form.phone}
          onChange={(event) => updateField("phone", event.target.value)}
          error={fieldError("phone")}
          disabled={isSaving}
        />
        <Field
          id="profile-location"
          label="Location"
          required
          value={form.location}
          onChange={(event) => updateField("location", event.target.value)}
          error={fieldError("location")}
          disabled={isSaving}
        />
      </div>

      <HomeLocationFields
        idPrefix="profile"
        value={homeLocation}
        onChange={setHomeLocation}
        pointError={fieldError("home_location")}
        labelError={fieldError("home_address_label")}
        disabled={isSaving}
      />

      {error && <p className="rounded-md bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>}

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}

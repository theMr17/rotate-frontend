"use client";

import { useRef, useState } from "react";
import Avatar from "@/components/Avatar";
import { ApiError, deleteProfilePhoto, uploadProfilePhoto } from "@/lib/api";
import type { UserProfile } from "@/types/user";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

type ProfilePhotoProps = {
  profile: UserProfile;
  onChange: (profile: UserProfile) => void;
  editable?: boolean;
};

function photoErrorMessage(err: unknown) {
  if (!(err instanceof ApiError)) return "Couldn't reach the server. Check your connection and try again.";
  if (err.status === 400) return err.fields.photo?.[0] ?? err.message;
  if (err.status === 503) return "Photo uploads aren't available right now. Please try again later.";
  return err.message;
}

export default function ProfilePhoto({ profile, onChange, editable = false }: ProfilePhotoProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "confirm-remove" | "removing">("idle");
  const [error, setError] = useState<string | null>(null);

  const isBusy = status === "uploading" || status === "removing";
  const hasPhoto = Boolean(profile.profile_photo_url);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Upload a JPEG, PNG or WebP image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be 5 MB or smaller.");
      return;
    }

    setError(null);
    setStatus("uploading");
    try {
      onChange(await uploadProfilePhoto(file));
    } catch (err) {
      setError(photoErrorMessage(err));
    } finally {
      setStatus("idle");
    }
  }

  async function handleRemove() {
    setError(null);
    setStatus("removing");
    try {
      await deleteProfilePhoto();
      onChange({ ...profile, profile_photo_url: "" });
    } catch (err) {
      setError(photoErrorMessage(err));
    } finally {
      setStatus("idle");
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative w-fit">
        <Avatar name={profile.name || profile.email} photoUrl={profile.profile_photo_url} size={96} />
        {isBusy && (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-white/70">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          </span>
        )}
      </div>

      <div className="min-w-0">
        <p className="truncate text-lg font-semibold text-gray-900">{profile.name}</p>
        <p className="truncate text-sm text-gray-500">{profile.email}</p>

        {editable && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept={ALLOWED_TYPES.join(",")}
              onChange={handleFile}
              className="hidden"
              aria-label="Choose a profile photo"
            />

            {status === "confirm-remove" ? (
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <span className="text-gray-700">Remove your photo?</span>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="rounded-md bg-red-600 px-3 py-1.5 font-medium text-white hover:bg-red-700"
                >
                  Remove
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="font-medium text-gray-600 hover:underline"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={isBusy}
                  className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === "uploading" ? "Uploading..." : hasPhoto ? "Change photo" : "Add photo"}
                </button>
                {hasPhoto && (
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setStatus("confirm-remove");
                    }}
                    disabled={isBusy}
                    className="font-medium text-gray-600 hover:underline disabled:opacity-60"
                  >
                    {status === "removing" ? "Removing..." : "Remove photo"}
                  </button>
                )}
              </div>
            )}

            {error ? (
              <p role="alert" className="mt-2 text-xs text-red-600">
                {error}
              </p>
            ) : (
              <p className="mt-2 text-xs text-gray-500">JPEG, PNG or WebP, up to 5 MB. Photo changes save right away.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

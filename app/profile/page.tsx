"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProfileEditForm from "@/components/profile/ProfileEditForm";
import ProfilePhoto from "@/components/profile/ProfilePhoto";
import ReviewList from "@/components/trust/ReviewList";
import TrustBadges from "@/components/trust/TrustBadges";
import { getProfile, logout } from "@/lib/api";
import { formatPoint, mapUrl } from "@/lib/homeLocation";
import type { UserProfile } from "@/types/user";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const currentProfile = await getProfile();
        if (!cancelled) setProfile(currentProfile);
      } catch (err) {
        if (cancelled) return;

        const message = err instanceof Error ? err.message : "Unable to load your profile.";
        if (message === "Please log in to continue.") {
          router.replace("/login");
        } else {
          setError(message);
        }
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  function startEditing() {
    setSavedNotice(false);
    setIsEditing(true);
  }

  function handleSaved(updated: UserProfile) {
    setProfile(updated);
    setIsEditing(false);
    setSavedNotice(true);
  }

  if (!profile) {
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-16 text-gray-500">
        {error ?? "Loading profile..."}
      </main>
    );
  }

  return (
    <main className="flex flex-1 justify-center bg-emerald-50 px-4 py-12 sm:py-16">
      <section className="w-full max-w-2xl rounded-xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 border-b border-gray-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">Your account</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
              {isEditing ? "Edit profile" : "Profile"}
            </h1>
          </div>
          {!isEditing && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={startEditing}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
              >
                Edit profile
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Log out
              </button>
            </div>
          )}
        </div>

        <div className="border-b border-gray-100 py-6">
          <ProfilePhoto key={isEditing ? "edit" : "view"} profile={profile} onChange={setProfile} editable={isEditing} />
        </div>

        {isEditing ? (
          <ProfileEditForm profile={profile} onSaved={handleSaved} onCancel={() => setIsEditing(false)} />
        ) : (
          <>
            {savedNotice && (
              <p role="status" className="mt-6 rounded-md bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
                Profile updated.
              </p>
            )}

            <dl className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-gray-500">Full name</dt>
                <dd className="mt-1 font-medium text-gray-900">{profile.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Email address</dt>
                <dd className="mt-1 font-medium text-gray-900">{profile.email || "Not available"}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Phone number</dt>
                <dd className="mt-1 font-medium text-gray-900">{profile.phone || "Not available"}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Location</dt>
                <dd className="mt-1 font-medium text-gray-900">{profile.location || "Not available"}</dd>
              </div>
              {profile.role && (
                <div>
                  <dt className="text-sm text-gray-500">Role</dt>
                  <dd className="mt-1 font-medium capitalize text-gray-900">{profile.role}</dd>
                </div>
              )}
            </dl>

            <div className="mt-8 border-t border-gray-100 pt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Home location</h2>
              <dl className="mt-4 grid gap-5 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-gray-500">Area</dt>
                  <dd className="mt-1 font-medium text-gray-900">{profile.home_address_label || "Not set"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Coordinates</dt>
                  <dd className="mt-1 font-medium text-gray-900">
                    {profile.home_location ? (
                      <>
                        <span className="tabular-nums">{formatPoint(profile.home_location)}</span>{" "}
                        <a
                          href={mapUrl(profile.home_location)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-emerald-700 hover:underline"
                        >
                          View on map
                        </a>
                      </>
                    ) : (
                      "Not set"
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-8 border-t border-gray-100 pt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Trust</h2>
              <div className="mt-4">
                <TrustBadges trust={profile.trust} />
              </div>
            </div>

            <div className="mt-8 border-t border-gray-100 pt-6">
              <ReviewList userId={profile.id} title="Reviews about you" emptyText="No one has reviewed you yet." />
            </div>
          </>
        )}
      </section>
    </main>
  );
}

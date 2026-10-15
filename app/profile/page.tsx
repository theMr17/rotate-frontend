"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet, logout, type UserProfile } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const currentProfile = await apiGet<UserProfile>("/profile");
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
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">Profile</h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Log out
          </button>
        </div>

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
      </section>
    </main>
  );
}
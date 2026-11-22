"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Avatar from "@/components/Avatar";
import ReviewList from "@/components/trust/ReviewList";
import TrustBadges from "@/components/trust/TrustBadges";
import { ApiError, getPublicProfile } from "@/lib/api";
import type { PublicProfile } from "@/types/user";

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getPublicProfile(id)
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/login");
        } else if (err instanceof ApiError && err.status === 404) {
          setError("This user doesn't exist or is no longer active.");
        } else {
          setError(err instanceof Error ? err.message : "Couldn't load this profile.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id, router]);

  if (!profile) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p className={error ? "font-medium text-red-600" : "text-gray-500"}>{error ?? "Loading profile..."}</p>
        {error && (
          <Link href="/items" className="mt-4 inline-block font-medium text-emerald-700 hover:underline">
            Browse items
          </Link>
        )}
      </main>
    );
  }

  const memberSince = new Date(profile.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <main className="flex flex-1 justify-center bg-emerald-50 px-4 py-12 sm:py-16">
      <section className="w-full max-w-3xl rounded-xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar name={profile.name} photoUrl={profile.profile_photo_url} size={96} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">{profile.name}</h1>
              {profile.is_verified && (
                <span className="rounded-sm bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                  Verified
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {profile.location && <>{profile.location} - </>}Member since {memberSince}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <TrustBadges trust={profile.trust} />
        </div>

        <div className="mt-8 border-t border-gray-100 pt-6">
          <ReviewList userId={profile.id} title="Reviews" emptyText={`${profile.name} has no reviews yet.`} />
        </div>
      </section>
    </main>
  );
}

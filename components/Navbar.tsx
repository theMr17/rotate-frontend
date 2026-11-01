"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Avatar from "@/components/Avatar";
import {
  AUTH_CHANGED_EVENT,
  getCurrentUserName,
  getProfile,
  getStoredProfile,
} from "@/lib/api";
import type { UserProfile } from "@/types/user";

const links = [
  { href: "/items", label: "Browse" },
  { href: "/orders", label: "My Orders" },
  { href: "/items/new", label: "List an Item" },
];

export default function Navbar() {
  const [userName, setUserName] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    function syncAuthState() {
      setUserName(getCurrentUserName());
      setProfile(getStoredProfile());
    }

    syncAuthState();
    window.addEventListener(AUTH_CHANGED_EVENT, syncAuthState);
    window.addEventListener("storage", syncAuthState);

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, syncAuthState);
      window.removeEventListener("storage", syncAuthState);
    };
  }, []);

  // Logged in but no profile stored yet (e.g. right after login): load it once.
  // getProfile() stores the result and fires AUTH_CHANGED_EVENT, which updates `profile` above.
  useEffect(() => {
    if (userName && !profile) getProfile().catch(() => {});
  }, [userName, profile]);

  return (
    <header className="border-b border-gray-200">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold">
          Rotate
        </Link>
        <div className="flex items-center gap-6">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:underline">
              {link.label}
            </Link>
          ))}
          {userName ? (
            <Link
              href="/profile"
              title={`Open ${userName}'s profile`}
              className="flex items-center gap-2 rounded-full border border-gray-300 py-1 pl-1 pr-4 text-sm font-medium hover:bg-gray-50"
            >
              <Avatar name={profile?.name || userName} photoUrl={profile?.profile_photo_url ?? ""} size={28} decorative />
              My Profile
            </Link>
          ) : (
            <Link href="/login" className="rounded-md bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-white">
              Log in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
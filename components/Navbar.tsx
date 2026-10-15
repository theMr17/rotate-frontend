"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AUTH_CHANGED_EVENT,
  getCurrentUserName,
} from "@/lib/api";

const links = [
  { href: "/items", label: "Browse" },
  { href: "/orders", label: "My Orders" },
  { href: "/items/new", label: "List an Item" },
];

export default function Navbar() {
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    function syncAuthState() {
      setUserName(getCurrentUserName());
    }

    syncAuthState();
    window.addEventListener(AUTH_CHANGED_EVENT, syncAuthState);
    window.addEventListener("storage", syncAuthState);

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, syncAuthState);
      window.removeEventListener("storage", syncAuthState);
    };
  }, []);

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
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
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
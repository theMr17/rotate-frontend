"use client";

import Image from "next/image";
import { useState } from "react";

type AvatarProps = {
  name: string;
  photoUrl: string;
  size?: number;
  decorative?: boolean;
  className?: string;
};

function initialsFor(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "?";
  const letters = words.length === 1 ? words[0].slice(0, 1) : words[0][0] + words[words.length - 1][0];
  return letters.toUpperCase();
}

export default function Avatar({ name, photoUrl, size = 40, decorative = false, className = "" }: AvatarProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showPhoto = Boolean(photoUrl) && failedUrl !== photoUrl;
  const dimensions = { width: size, height: size };

  if (showPhoto) {
    return (
      <Image
        src={photoUrl}
        alt={decorative ? "" : `${name}'s profile photo`}
        width={size}
        height={size}
        style={dimensions}
        onError={() => setFailedUrl(photoUrl)}
        className={`shrink-0 rounded-full bg-gray-100 object-cover ${className}`}
      />
    );
  }

  return (
    <span
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : name}
      aria-hidden={decorative || undefined}
      style={{ ...dimensions, fontSize: Math.max(11, Math.round(size * 0.4)) }}
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700 ${className}`}
    >
      {initialsFor(name)}
    </span>
  );
}

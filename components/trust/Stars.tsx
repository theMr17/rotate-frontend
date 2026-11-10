"use client";

import { useState } from "react";

export const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

export function Stars({ rating, className = "" }: { rating: number; className?: string }) {
  return (
    <span role="img" aria-label={`${rating} out of 5 stars`} className={`tracking-tight ${className}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} aria-hidden="true" className={n <= rating ? "text-amber-400" : "text-gray-300"}>
          ★
        </span>
      ))}
    </span>
  );
}

type StarPickerProps = {
  name: string;
  value: number;
  onChange: (value: number) => void;
  error?: string;
  disabled?: boolean;
};

export function StarPicker({ name, value, onChange, error, disabled }: StarPickerProps) {
  const [hovered, setHovered] = useState(0);
  const shown = hovered || value;
  const errorId = `${name}-error`;

  return (
    <fieldset disabled={disabled} aria-describedby={error ? errorId : undefined}>
      <legend className="mb-1.5 text-sm font-medium text-gray-700">Rating</legend>
      <div className="flex items-center gap-3">
        <div className="flex" onMouseLeave={() => setHovered(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer px-0.5" onMouseEnter={() => setHovered(n)}>
              <input
                type="radio"
                name={name}
                value={n}
                checked={value === n}
                onChange={() => onChange(n)}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className={`block rounded text-3xl leading-none transition peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500 ${
                  n <= shown ? "text-amber-400" : "text-gray-300"
                }`}
              >
                ★
              </span>
              <span className="sr-only">
                {n} {n === 1 ? "star" : "stars"}, {RATING_LABELS[n]}
              </span>
            </label>
          ))}
        </div>
        <span className="text-sm text-gray-500">{shown ? RATING_LABELS[shown] : "Choose a rating"}</span>
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
    </fieldset>
  );
}

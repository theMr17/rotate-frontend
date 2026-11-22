import type { InputHTMLAttributes, ReactNode } from "react";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: ReactNode;
  error?: string;
  invalid?: boolean;
  hint?: ReactNode;
  className?: string;
};

export default function Field({ id, label, error, invalid, hint, className, ...input }: FieldProps) {
  const isInvalid = invalid || Boolean(error);
  const messageId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={isInvalid || undefined}
        aria-describedby={messageId}
        className={`w-full rounded-md border px-3 py-2.5 outline-none transition focus:ring-2 disabled:bg-gray-50 disabled:text-gray-500 ${
          isInvalid
            ? "border-red-400 focus:border-red-500 focus:ring-red-100"
            : "border-gray-300 focus:border-emerald-500 focus:ring-emerald-100"
        }`}
        {...input}
      />
      {error ? (
        <p id={messageId} className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="mt-1.5 text-xs text-gray-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

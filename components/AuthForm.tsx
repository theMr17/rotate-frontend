"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { login, register, setPendingUser } from "@/lib/api";

type AuthFormProps = {
  mode: "login" | "register";
};

export default function AuthForm({ mode }: AuthFormProps) {
  const isRegister = mode === "register";
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    location: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isRegister) {
        await register(form);
        setPendingUser(form.name, form.email);
        router.push("/login");
      } else {
        await login(form.email, form.password);
        router.push("/items");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-emerald-50 px-4 py-12 sm:py-16">
      <section className="w-full max-w-md rounded-xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
            {isRegister ? "Join the community" : "Welcome back"}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            {isRegister ? "Create your account" : "Log in to Rotate"}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {isRegister
              ? "Borrow more, buy less, and share what you have."
              : "Pick up where you left off with your local rentals."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
                Full name
              </label>
              <input
                id="name"
                required
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {isRegister && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Phone number
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div>
                <label htmlFor="location" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  id="location"
                  required
                  value={form.location}
                  onChange={(event) => updateField("location", event.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete={isRegister ? "new-password" : "current-password"}
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
            {isRegister && <p className="mt-1.5 text-xs text-gray-500">Use at least 8 characters.</p>}
          </div>

          {error && <p className="rounded-md bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-emerald-600 px-4 py-2.5 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Please wait…" : isRegister ? "Create account" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          {isRegister ? "Already have an account?" : "New to Rotate?"}{" "}
          <Link href={isRegister ? "/login" : "/register"} className="font-medium text-emerald-700 hover:underline">
            {isRegister ? "Log in" : "Create an account"}
          </Link>
        </p>
      </section>
    </main>
  );
}
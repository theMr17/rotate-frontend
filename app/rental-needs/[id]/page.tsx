"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { apiGet, apiPost } from "@/lib/api";

import {
  getRentalNeed,
} from "@/lib/rental-needs-api";

import RentalNeedResponseForm from "@/components/rental-needs/RentalNeedResponseForm";

import type { Item } from "@/types/item";

import type {
  RentalNeedDetail,
  RentalNeedResponse,
  RentalNeedOrder,
} from "@/types/rental-need";


type CurrentUser = {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
};


function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}


function formatStatus(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}


function statusClass(status: string) {
  switch (status) {
    case "open":
    case "accepted":
    case "pending":
      return "bg-emerald-50 text-emerald-700";

    case "fulfilled":
    case "completed":
    case "active":
      return "bg-blue-50 text-blue-700";

    case "cancelled":
    case "rejected":
      return "bg-red-50 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}


export default function RentalNeedDetailPage() {
  const params = useParams<{ id: string }>();

  const needId = Number(params.id);

  const [need, setNeed] = useState<RentalNeedDetail | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [myItems, setMyItems] = useState<Item[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);


  const loadNeed = useCallback(async () => {
    if (!Number.isInteger(needId) || needId <= 0) {
      setError("Invalid rental request ID.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getRentalNeed(needId);
      setNeed(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load the rental request.",
      );
    } finally {
      setLoading(false);
    }
  }, [needId]);


  useEffect(() => {
    const timer = setTimeout(() => {
      void loadNeed();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadNeed, refreshKey]);


  // Load current user and their items.

    const requesterId = need?.requester;

    useEffect(() => {
    if (requesterId === undefined) return;

    let cancelled = false;

    async function loadUserData() {
        try {
        const profile = await apiGet<CurrentUser>("/user/profile");

        if (cancelled) return;

        setCurrentUser(profile);

        // Fetch the user's items only if they are not
        // the person who posted this requirement.
        if (profile.id !== requesterId) {
            const items = await apiGet<Item[]>("/items/?mine=true");

            if (!cancelled) {
            setMyItems(items);
            }
        } else {
            setMyItems([]);
        }

        } catch {
        if (!cancelled) {
            setCurrentUser(null);
            setMyItems([]);
        }
        }
    }

    void loadUserData();

    return () => {
        cancelled = true;
    };

    }, [requesterId]);


  const isRequester =
    currentUser !== null &&
    need !== null &&
    currentUser.id === need.requester;

  const alreadyResponded =
    currentUser !== null &&
    need !== null &&
    need.responses.some(
      (response) => response.provider === currentUser.id,
    );


  async function refreshRequest() {
    setRefreshKey((current) => current + 1);
  }


  async function handleOrderAction(
    orderId: number,
    action: "accept" | "reject",
  ) {
    setActionLoading(orderId);
    setActionError(null);

    try {
      await apiPost<RentalNeedOrder>(
        `/orders/${orderId}/${action}/`,
        {},
      );

      await loadNeed();
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Could not complete the action.",
      );
    } finally {
      setActionLoading(null);
    }
  }


  if (loading && !need) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12 text-gray-500">
        Loading rental request...
      </main>
    );
  }


  if (error || !need) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12">

        <p className="text-red-600">
          {error ?? "Rental request not found."}
        </p>

        <Link
          href="/rental-needs"
          className="mt-4 inline-block text-emerald-700 hover:underline"
        >
          Back to rental requests
        </Link>

      </main>
    );
  }


  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">

      {/* Back link */}

      <Link
        href="/rental-needs"
        className="text-sm font-medium text-emerald-700 hover:underline"
      >
        ← Back to rental requests
      </Link>


      {/* Request details */}

      <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

        <div className="flex flex-wrap items-center justify-between gap-3">

          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            {need.category}
          </span>

          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass(need.status)}`}
          >
            {formatStatus(need.status)}
          </span>

        </div>

        <h1 className="mt-5 text-2xl font-bold text-gray-900 sm:text-3xl">
          {need.title}
        </h1>

        <p className="mt-3 whitespace-pre-wrap leading-7 text-gray-600">
          {need.description || "No additional description provided."}
        </p>

        <div className="mt-7 grid gap-5 border-t border-gray-100 pt-6 sm:grid-cols-2">

          <div>
            <p className="text-sm text-gray-500">Requested by</p>
            <p className="mt-1 font-medium text-gray-900">
              {need.requester_name}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p className="mt-1 font-medium text-gray-900">
              {need.location}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Required from</p>
            <p className="mt-1 font-medium text-gray-900">
              {formatDate(need.start_time)}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Required until</p>
            <p className="mt-1 font-medium text-gray-900">
              {formatDate(need.end_time)}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Maximum hourly budget</p>
            <p className="mt-1 font-medium text-gray-900">
              {need.budget_per_hour
                ? `₹${need.budget_per_hour}/hour`
                : "Flexible"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Request ID</p>
            <p className="mt-1 font-medium text-gray-900">
              #{need.id}
            </p>
          </div>

        </div>

      </section>


      {/* Provider response form */}

      {need.status === "open" && !isRequester && currentUser && !alreadyResponded && (

        <div className="mt-7">

          <RentalNeedResponseForm
            needId={need.id}
            items={myItems}
            onSuccess={refreshRequest}
          />

        </div>

      )}


      {/* Login prompt */}

      {need.status === "open" && !currentUser && (

        <div className="mt-7 rounded-xl border border-gray-200 bg-white p-5">

          <p className="text-gray-700">
            Log in to offer one of your items for this requirement.
          </p>

          <Link
            href="/login"
            className="mt-3 inline-block font-medium text-emerald-700 hover:underline"
          >
            Log in to respond →
          </Link>

        </div>

      )}


      {/* Already responded */}

      {alreadyResponded && need.status === "open" && (

        <div className="mt-7 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
          You have already responded to this request. You can follow
          the status of your offer below.
        </div>

      )}


      {/* Provider responses */}

      <section className="mt-10">

        <div className="flex flex-wrap items-center justify-between gap-3">

          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Responses and offers
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {need.responses.length}{" "}
              {need.responses.length === 1 ? "provider has" : "providers have"}{" "}
              responded to this request.
            </p>
          </div>

          <button
            type="button"
            onClick={refreshRequest}
            className="text-sm font-medium text-emerald-700 hover:underline"
          >
            Refresh
          </button>

        </div>


        {need.responses.length === 0 && (

          <div className="mt-5 rounded-xl border border-dashed border-gray-300 px-6 py-10 text-center">

            <p className="font-medium text-gray-900">
              No offers yet
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Providers can respond with their available items and proposed rates.
            </p>

          </div>

        )}


        <div className="mt-5 space-y-5">

          {need.responses.map((response: RentalNeedResponse) => {

            const order = response.order;

            return (

              <article
                key={response.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >

                {/* Provider and order information */}

                <div className="flex flex-wrap items-start justify-between gap-3">

                  <div>

                    <p className="text-sm text-gray-500">
                      Offered by
                    </p>

                    <h3 className="mt-1 text-lg font-semibold text-gray-900">
                      {response.provider_name}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Order #{order.id} · {order.item.title}
                    </p>

                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass(order.status)}`}
                  >
                    {formatStatus(order.status)}
                  </span>

                </div>


                {/* Offer history */}

                <div className="mt-5 border-t border-gray-100 pt-4">

                  <h4 className="text-sm font-semibold text-gray-800">
                    Negotiation history
                  </h4>

                  <div className="mt-3 space-y-3">

                    {order.offers.map((offer) => (

                      <div
                        key={offer.id}
                        className="rounded-lg bg-gray-50 p-4"
                      >

                        <div className="flex flex-wrap items-center justify-between gap-2">

                          <p className="text-sm font-semibold text-gray-900">
                            {offer.proposed_by === response.provider
                              ? "Provider's offer"
                              : "Requester's counteroffer"}
                          </p>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(offer.status)}`}
                          >
                            {formatStatus(offer.status)}
                          </span>

                        </div>

                        <p className="mt-2 text-lg font-semibold text-emerald-700">
                          ₹{offer.hourly_rate}/hour
                        </p>

                        {offer.message && (
                          <p className="mt-1 text-sm text-gray-600">
                            {offer.message}
                          </p>
                        )}

                      </div>

                    ))}

                  </div>

                </div>


                {/* Requester's actions */}

                {isRequester &&
                  order.allowed_actions?.length > 0 &&
                  (order.allowed_actions.includes("accept") ||
                    order.allowed_actions.includes("reject")) && (

                  <div className="mt-5 flex flex-wrap gap-3 border-t border-gray-100 pt-4">

                    {order.allowed_actions.includes("accept") && (

                      <button
                        type="button"
                        disabled={actionLoading === order.id}
                        onClick={() => handleOrderAction(order.id, "accept")}
                        className="rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                      >
                        {actionLoading === order.id
                          ? "Processing..."
                          : "Accept offer"}
                      </button>

                    )}

                    {order.allowed_actions.includes("reject") && (

                      <button
                        type="button"
                        disabled={actionLoading === order.id}
                        onClick={() => handleOrderAction(order.id, "reject")}
                        className="rounded-md border border-red-300 px-5 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                      >
                        Reject offer
                      </button>

                    )}

                  </div>

                )}

              </article>

            );

          })}

        </div>


        {actionError && (

          <div className="mt-5 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {actionError}
          </div>

        )}

      </section>


      {/* Link to normal orders */}

      <div className="mt-8 border-t border-gray-200 pt-6">

        <Link
          href="/orders"
          className="text-sm font-medium text-emerald-700 hover:underline"
        >
          View all your orders →
        </Link>

      </div>

    </main>
  );
}
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { apiGet, apiPost } from "@/lib/api";

import {
  getRentalNeed,
  cancelRentalNeed,
} from "@/lib/rental-needs-api";

import RentalNeedResponseForm from "@/components/rental-needs/RentalNeedResponseForm";
import RentalNeedCounterOfferForm from "@/components/rental-needs/RentalNeedCounterOfferForm";

import type { Item } from "@/types/item";

import type {
  RentalNeedDetail,
  RentalNeedOrder,
} from "@/types/rental-need";


type CurrentUser = {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
};


// --------------------------------------------------
// Helper functions
// --------------------------------------------------

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
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
    case "pending":
      return "bg-emerald-50 text-emerald-700";

    case "accepted":
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


function sameEmail(first: string, second: string) {
  return first.trim().toLowerCase() === second.trim().toLowerCase();
}


// ==================================================
// Main page
// ==================================================

export default function RentalNeedDetailPage() {

  const params = useParams<{ id: string }>();
  const needId = Number(params.id);


  // --------------------------------------------------
  // State
  // --------------------------------------------------

  const [need, setNeed] = useState<RentalNeedDetail | null>(null);

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const [myItems, setMyItems] = useState<Item[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);


  // --------------------------------------------------
  // Load rental request
  // --------------------------------------------------

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
          : "Could not load the rental request."
      );

    } finally {

      setLoading(false);

    }

  }, [needId]);


  // Load request when the page opens.
  useEffect(() => {

    const timer = window.setTimeout(() => {
      void loadNeed();
    }, 0);

    return () => window.clearTimeout(timer);

  }, [loadNeed]);


  // --------------------------------------------------
  // Load logged-in user and their items
  // --------------------------------------------------

  const requesterId = need?.requester;

  useEffect(() => {

    if (requesterId === undefined) return;

    let cancelled = false;

    async function loadUserData() {

      try {

        const profile = await apiGet<CurrentUser>("/user/profile");

        if (cancelled) return;

        setCurrentUser(profile);

        // Requester does not need to load their own items.
        if (profile.id === requesterId) {
          setMyItems([]);
          return;
        }

        // Load the current provider's own listings.
        try {

          const items = await apiGet<Item[]>("/items/?mine=true");

          if (!cancelled) {
            setMyItems(items);
          }

        } catch {

          if (!cancelled) {
            setMyItems([]);
          }

        }

      } catch {

        // User is not logged in.
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


  // --------------------------------------------------
  // Determine current user's role
  // --------------------------------------------------

  const isRequester =
    currentUser !== null &&
    need !== null &&
    currentUser.id === need.requester;


  // Has this user already responded as a provider?
  const alreadyResponded =
    currentUser !== null &&
    need !== null &&
    need.responses.some(
      (response) => response.provider === currentUser.id
    );


  // --------------------------------------------------
  // Refresh request details
  // --------------------------------------------------

  async function refreshRequest() {
    await loadNeed();
  }


  // --------------------------------------------------
  // Cancel rental request
  // --------------------------------------------------

  async function handleCancelNeed() {

    if (!need) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this rental request? All pending provider offers will be rejected."
    );

    if (!confirmed) return;

    setCancelLoading(true);
    setCancelError(null);

    try {

      await cancelRentalNeed(need.id);

      await loadNeed();

    } catch (err) {

      setCancelError(
        err instanceof Error
          ? err.message
          : "Could not cancel the rental request."
      );

    } finally {

      setCancelLoading(false);

    }

  }


  // --------------------------------------------------
  // Accept or reject an offer
  // --------------------------------------------------

  async function handleOrderAction(
    orderId: number,
    action: "accept" | "reject"
  ) {

    setActionLoading(orderId);
    setActionError(null);

    try {

      await apiPost<RentalNeedOrder>(
        `/orders/${orderId}/${action}/`,
        {}
      );

      await loadNeed();

    } catch (err) {

      setActionError(
        err instanceof Error
          ? err.message
          : "Could not complete the action."
      );

    } finally {

      setActionLoading(null);

    }

  }


  // --------------------------------------------------
  // Loading state
  // --------------------------------------------------

  if (loading && !need) {

    return (
      <main className="mx-auto max-w-5xl px-4 py-12 text-gray-500">
        Loading rental request...
      </main>
    );

  }


  // --------------------------------------------------
  // Error state
  // --------------------------------------------------

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


  // ==================================================
  // Main UI
  // ==================================================

  return (

    <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">

      {/* Back navigation */}

      <Link
        href="/rental-needs"
        className="text-sm font-medium text-emerald-700 hover:underline"
      >
        Back to rental requests
      </Link>


      {/* -------------------------------------------- */}
      {/* Rental request details */}
      {/* -------------------------------------------- */}

      <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

        <div className="flex flex-wrap items-center justify-between gap-3">

          <span className="rounded-sm bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            {need.category}
          </span>

          <span
            className={`rounded-sm px-3 py-1 text-xs font-medium ${statusClass(need.status)}`}
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
            <p className="text-sm text-gray-500">
              Requested by
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {need.requester_name}
            </p>
          </div>


          <div>
            <p className="text-sm text-gray-500">
              Location
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {need.location}
            </p>
          </div>


          <div>
            <p className="text-sm text-gray-500">
              Required from
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {formatDate(need.start_time)}
            </p>
          </div>


          <div>
            <p className="text-sm text-gray-500">
              Required until
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {formatDate(need.end_time)}
            </p>
          </div>


          <div>
            <p className="text-sm text-gray-500">
              Maximum hourly budget
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {need.budget_per_hour
                ? `Rs ${need.budget_per_hour}/hour`
                : "Flexible"}
            </p>
          </div>


          <div>
            <p className="text-sm text-gray-500">
              Request ID
            </p>

            <p className="mt-1 font-medium text-gray-900">
              #{need.id}
            </p>
          </div>

        </div>


        {/* Cancel request - requester only */}

        {isRequester && need.status === "open" && (

          <div className="mt-7 border-t border-gray-100 pt-5">

            <button
              type="button"
              onClick={handleCancelNeed}
              disabled={cancelLoading}
              className="rounded-md border border-red-300 px-5 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
            >
              {cancelLoading
                ? "Cancelling..."
                : "Cancel request"}
            </button>


            {cancelError && (
              <p className="mt-2 text-sm text-red-600">
                {cancelError}
              </p>
            )}

          </div>

        )}

      </section>


      {/* -------------------------------------------- */}
      {/* Provider response form */}
      {/* -------------------------------------------- */}

      {need.status === "open" &&
        !isRequester &&
        currentUser &&
        !alreadyResponded && (

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
            Log in to respond
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


      {/* -------------------------------------------- */}
      {/* Provider responses and offers */}
      {/* -------------------------------------------- */}

      <section className="mt-10">

        <div className="flex flex-wrap items-center justify-between gap-3">

          <div>

            <h2 className="text-xl font-bold text-gray-900">
              Responses and offers
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {need.responses.length}{" "}
              {need.responses.length === 1
                ? "provider has"
                : "providers have"}{" "}
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


        {/* Empty state */}

        {need.responses.length === 0 && (

          <div className="mt-5 rounded-xl border border-dashed border-gray-300 px-6 py-10 text-center">

            <p className="font-medium text-gray-900">
              No offers yet
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Providers can respond with their available items
              and proposed rates.
            </p>

          </div>

        )}


        {/* Response cards */}

        <div className="mt-5 space-y-5">

          {need.responses.map((response) => {

            const order = response.order;


            // Find the currently pending offer.
            const pendingOffer = order.offers.find(
              (offer) => offer.status === "pending"
            );


            // The requester and this response's provider
            // are the only participants in this Order.
            const currentUserIsInThisOrder =
              currentUser !== null &&
              (
                currentUser.id === need.requester ||
                currentUser.id === response.provider
              );


            // The current user can respond only if the
            // other participant made the pending offer.
            const canRespondToOffer = Boolean(
              currentUser &&
              currentUserIsInThisOrder &&
              order.status === "requested" &&
              pendingOffer &&
              !sameEmail(
                pendingOffer.proposed_by,
                currentUser.email
              )
            );


            // Is the current user waiting for the other
            // participant to respond to their offer?
            const waitingForOtherPerson = Boolean(
              currentUser &&
              currentUserIsInThisOrder &&
              order.status === "requested" &&
              pendingOffer &&
              sameEmail(
                pendingOffer.proposed_by,
                currentUser.email
              )
            );


            return (

              <article
                key={response.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >

                {/* Provider information */}

                <div className="flex flex-wrap items-start justify-between gap-3">

                  <div>

                    <p className="text-sm text-gray-500">
                      Offered by
                    </p>

                    <h3 className="mt-1 text-lg font-semibold text-gray-900">
                      {response.provider_name}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Order #{order.id} - {order.item_title}
                    </p>

                  </div>


                  <span
                    className={`rounded-sm px-3 py-1 text-xs font-medium ${statusClass(order.status)}`}
                  >
                    {formatStatus(order.status)}
                  </span>

                </div>


                {/* ------------------------------------ */}
                {/* Negotiation history */}
                {/* ------------------------------------ */}

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
                            {sameEmail(offer.proposed_by, order.lender)
                              ? "Provider's offer"
                              : "Requester's offer"}
                          </p>


                          <span
                            className={`rounded-sm px-2.5 py-1 text-xs font-medium ${statusClass(offer.status)}`}
                          >
                            {formatStatus(offer.status)}
                          </span>

                        </div>


                        <p className="mt-2 text-lg font-semibold text-emerald-700">
                          Rs {offer.hourly_rate}/hour
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


                {/* ------------------------------------ */}
                {/* Accept / reject / counteroffer */}
                {/* ------------------------------------ */}

                {canRespondToOffer && pendingOffer && (

                  <div className="mt-5 border-t border-gray-100 pt-4">

                    <p className="mb-3 text-sm font-medium text-gray-800">
                      This offer is waiting for your response.
                    </p>


                    <div className="flex flex-wrap gap-3">

                      <button
                        type="button"
                        disabled={actionLoading !== null}
                        onClick={() =>
                          handleOrderAction(order.id, "accept")
                        }
                        className="rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                      >
                        {actionLoading === order.id
                          ? "Processing..."
                          : "Accept offer"}
                      </button>


                      <button
                        type="button"
                        disabled={actionLoading !== null}
                        onClick={() =>
                          handleOrderAction(order.id, "reject")
                        }
                        className="rounded-md border border-red-300 px-5 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                      >
                        {actionLoading === order.id
                          ? "Processing..."
                          : "Reject offer"}
                      </button>

                    </div>


                    {/* Counteroffer form */}

                    <RentalNeedCounterOfferForm
                      orderId={order.id}
                      initialRate={pendingOffer.hourly_rate}
                      onSuccess={refreshRequest}
                    />

                  </div>

                )}


                {/* Waiting for the other participant */}

                {waitingForOtherPerson && (

                  <div className="mt-5 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                    Your offer has been submitted. Waiting for the
                    other participant to accept, reject, or make a
                    counteroffer.
                  </div>

                )}


              </article>

            );

          })}

        </div>


        {/* Order action errors */}

        {actionError && (

          <div className="mt-5 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {actionError}
          </div>

        )}

      </section>


      {/* -------------------------------------------- */}
      {/* Orders navigation */}
      {/* -------------------------------------------- */}

      <div className="mt-8 border-t border-gray-200 pt-6">

        <Link
          href="/orders"
          className="text-sm font-medium text-emerald-700 hover:underline"
        >
          View all your orders
        </Link>

      </div>

    </main>

  );

}
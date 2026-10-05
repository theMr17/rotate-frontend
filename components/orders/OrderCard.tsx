import Link from "next/link";

import type { Order } from "@/types/order";

import StatusBadge from "./StatusBadge";

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function OrderCard({ order }: { order: Order }) {
  const latestOffer = order.offers[order.offers.length - 1];
  const rate = order.agreed_hourly_rate ?? latestOffer?.hourly_rate;

  return (
    <Link
      href={`/orders/${order.id}`}
      className="block rounded-lg border border-gray-200 p-4 hover:border-blue-500"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{order.item_title}</h2>
        <StatusBadge status={order.status} />
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Borrower: {order.borrower} · Lender: {order.lender}
      </p>
      <p className="mt-2 text-sm">
        {formatTime(order.start_time)} → {formatTime(order.end_time)}
      </p>
      {rate && <p className="mt-1 text-sm font-medium">₹{rate}/hr</p>}
    </Link>
  );
}
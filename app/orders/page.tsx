import OrderCard from "@/components/orders/OrderCard";
import type { Order } from "@/types/order";

const sampleOrders: Order[] = [
  {
    id: 3,
    item: 1,
    item_title: "Hero cycle",
    borrower: "amit",
    lender: "rahul",
    start_time: "2026-10-04T20:20:31Z",
    end_time: "2026-10-04T22:20:31Z",
    status: "requested",
    agreed_hourly_rate: null,
    deposit_amount: "0.00",
    offers: [
      {
        id: 4,
        proposed_by: "amit",
        hourly_rate: "50.00",
        message: "",
        status: "pending",
        created_at: "2026-10-03T19:20:40Z",
      },
    ],
    created_at: "2026-10-03T19:20:40Z",
    updated_at: "2026-10-03T19:20:40Z",
  },
  {
    id: 2,
    item: 1,
    item_title: "Hero cycle",
    borrower: "priya",
    lender: "rahul",
    start_time: "2026-10-04T16:05:19Z",
    end_time: "2026-10-04T18:05:19Z",
    status: "accepted",
    agreed_hourly_rate: "30.00",
    deposit_amount: "0.00",
    offers: [],
    created_at: "2026-10-03T16:05:19Z",
    updated_at: "2026-10-03T19:20:31Z",
  },
];

export default function OrdersPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">My Orders</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {sampleOrders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </main>
  );
}
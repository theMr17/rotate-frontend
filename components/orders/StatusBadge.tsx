import type { OrderStatus } from "@/types/order";

const styles: Record<OrderStatus, string> = {
  requested: "bg-yellow-100 text-yellow-800",
  accepted: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  returned: "bg-purple-100 text-purple-800",
  disputed: "bg-red-100 text-red-800",
  completed: "bg-gray-200 text-gray-800",
  rejected: "bg-gray-100 text-gray-500",
  cancelled: "bg-gray-100 text-gray-500",
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}
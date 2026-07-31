import type { OrderStatus } from "../hooks/api/useUpdateOrderStatus";

export const getEffectiveOrderStatus = (order: {
  status?: string | null;
  submittedAt?: string | null;
}): OrderStatus => {
  if (order.status) {
    return order.status as OrderStatus;
  }

  return order.submittedAt ? "ORDERED" : "ORDERING";
};

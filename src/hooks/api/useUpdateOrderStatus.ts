import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAmplifyClient } from "./useAmplifyClient";

export type OrderStatus = "ORDERING" | "ORDERED" | "PREPARING" | "READY" | "DELIVERING" | "DELIVERED";

export const useUpdateOrderStatus = () => {
  const client = useAmplifyClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      await client.models.Order.update({ id, status });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

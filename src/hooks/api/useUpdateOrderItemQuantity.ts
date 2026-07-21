import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAmplifyClient } from "./useAmplifyClient";

export const useUpdateOrderItemQuantity = () => {
  const client = useAmplifyClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      if (quantity <= 0) {
        await client.models.OrderItem.delete({ id });
        return;
      }

      await client.models.OrderItem.update({ id, quantity });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orderItems"] });
    },
  });
};

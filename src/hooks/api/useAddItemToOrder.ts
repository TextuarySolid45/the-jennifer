import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAmplifyClient } from "./useAmplifyClient";

export const useAddItemToOrder = () => {
  const client = useAmplifyClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, orderId }: { itemId: string; orderId: string | null }) => {
      // If there is no active selected order, ignore the input as requested.
      if (!orderId) {
        return null;
      }

      const existingOrderItems = await client.models.OrderItem.list({
        selectionSet: ["id", "orderId", "itemId", "quantity"],
      });

      const existingOrderItem = existingOrderItems.data.find(
        (orderItem) => orderItem.orderId === orderId && orderItem.itemId === itemId,
      );

      if (existingOrderItem) {
        await client.models.OrderItem.update({
          id: existingOrderItem.id,
          quantity: existingOrderItem.quantity + 1,
        });
      } else {
        await client.models.OrderItem.create({
          orderId,
          itemId,
          quantity: 1,
        });
      }

      return orderId;
    },
    onSuccess: async (targetOrderId) => {
      if (!targetOrderId) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
        queryClient.invalidateQueries({ queryKey: ["orderItems"] }),
      ]);
    },
  });
};

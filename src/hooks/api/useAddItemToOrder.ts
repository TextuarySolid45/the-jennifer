import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAmplifyClient } from "./useAmplifyClient";

export const useAddItemToOrder = () => {
  const client = useAmplifyClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      flavorId,
      orderId,
    }: {
      itemId: string;
      flavorId?: string | null;
      orderId: string | null;
    }) => {
      // If there is no active selected order, ignore the input as requested.
      if (!orderId) {
        return null;
      }

      const existingOrderItems = await client.models.OrderItem.list({
        selectionSet: ["id", "orderId", "itemId", "flavorId", "quantity"],
      });

      const existingOrderItem = existingOrderItems.data.find(
        (orderItem) =>
          orderItem.orderId === orderId &&
          orderItem.itemId === itemId &&
          (orderItem.flavorId ?? null) === (flavorId ?? null),
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
          flavorId: flavorId ?? null,
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

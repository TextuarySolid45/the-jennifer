import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAmplifyClient } from "./useAmplifyClient";

export const useDeleteOrder = () => {
  const client = useAmplifyClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const existingOrderItems = await client.models.OrderItem.list({
        selectionSet: ["id", "orderId"],
      });

      const itemsInOrder = existingOrderItems.data.filter((orderItem) => orderItem.orderId === id);

      await Promise.all(itemsInOrder.map((orderItem) => client.models.OrderItem.delete({ id: orderItem.id })));
      await client.models.Order.delete({ id });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
        queryClient.invalidateQueries({ queryKey: ["orderItems"] }),
      ]);
    },
  });
};

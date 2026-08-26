import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAmplifyClient } from "./useAmplifyClient";

export const useDeleteVisit = () => {
  const client = useAmplifyClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const existingOrders = await client.models.Order.list({
        selectionSet: ["id", "visitId"],
      });

      const ordersOnVisit = existingOrders.data.filter((order) => order.visitId === id);

      // Unassign any orders pointing at this visit so they don't dangle on a deleted id.
      await Promise.all(
        ordersOnVisit.map((order) => client.models.Order.update({ id: order.id, visitId: null })),
      );

      await client.models.Visit.delete({ id });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["visits"] });
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

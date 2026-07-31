import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAmplifyClient } from "./useAmplifyClient";

export const useCompleteOrder = () => {
  const client = useAmplifyClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { data: order } = await client.models.Order.get({ id });

      if (!order || order.submittedAt) {
        throw new Error("Order has already been submitted.");
      }

      const { data } = await client.models.Order.update({
        id,
        submittedAt: new Date().toISOString(),
      });

      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

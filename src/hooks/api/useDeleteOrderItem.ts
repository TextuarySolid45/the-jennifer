import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAmplifyClient } from "./useAmplifyClient";

export const useDeleteOrderItem = () => {
  const client = useAmplifyClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      await client.models.OrderItem.delete({ id });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orderItems"] });
    },
  });
};

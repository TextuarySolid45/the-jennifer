import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAmplifyClient } from "./useAmplifyClient";

export const useUpdateOrder = () => {
  const client = useAmplifyClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      visitId,
    }: {
      id: string;
      name?: string;
      visitId?: string | null;
    }) => {
      await client.models.Order.update({ id, name, visitId });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

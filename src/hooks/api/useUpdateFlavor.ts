import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAmplifyClient } from "./useAmplifyClient";

export const useUpdateFlavor = () => {
  const client = useAmplifyClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      available,
    }: {
      id: string;
      name?: string;
      available?: boolean;
    }) => {
      await client.models.Flavor.update({ id, name, available });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["flavors"] });
    },
  });
};

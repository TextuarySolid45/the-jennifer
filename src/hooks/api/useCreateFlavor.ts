import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAmplifyClient } from "./useAmplifyClient";

export type CreateFlavorInput = {
  itemId: string;
  name: string;
};

export const useCreateFlavor = () => {
  const client = useAmplifyClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, name }: CreateFlavorInput) => {
      const newFlavor = await client.models.Flavor.create({ itemId, name, available: true });

      if (!newFlavor.data?.id) {
        throw new Error("Unable to create flavor");
      }

      return newFlavor.data.id;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["flavors"] });
    },
  });
};

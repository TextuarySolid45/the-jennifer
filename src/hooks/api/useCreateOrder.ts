import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAmplifyClient } from "./useAmplifyClient";

export type CreateOrderInput = {
  name: string;
  household: string;
  expectedDeliveryDate: string;
  notes: string;
};

export const useCreateOrder = () => {
  const client = useAmplifyClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateOrderInput) => {
      const newOrder = await client.models.Order.create(input);

      if (!newOrder.data?.id) {
        throw new Error("Unable to create order");
      }

      return newOrder.data.id;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

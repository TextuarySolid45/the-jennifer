import { useQuery } from "@tanstack/react-query";
import { useAmplifyClient } from "./useAmplifyClient";

export const useGetOrderItems = () => {
  const client = useAmplifyClient();

  return useQuery({
    queryKey: ["orderItems"],
    queryFn: async () => {
      const orderItems = await client.models.OrderItem.list({
        selectionSet: ["id", "orderId", "itemId", "flavorId", "quantity", "createdAt", "updatedAt"],
      });

      return orderItems;
    },
  });
};

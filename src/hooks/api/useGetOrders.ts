import { useQuery } from "@tanstack/react-query";
import { useAmplifyClient } from "./useAmplifyClient";

export const useGetOrders = () => {
  const client = useAmplifyClient();

  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const orders = await client.models.Order.list({
        selectionSet: [
          "id",
          "name",
          "household",
          "expectedDeliveryDate",
          "notes",
          "status",
          "submittedAt",
          "createdAt",
          "updatedAt",
        ],
      });

      return orders;
    },
  });
};

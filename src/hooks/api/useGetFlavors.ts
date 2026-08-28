import { useQuery } from "@tanstack/react-query";
import { useAmplifyClient } from "./useAmplifyClient";

export const useGetFlavors = () => {
  const client = useAmplifyClient();

  return useQuery({
    queryKey: ["flavors"],
    queryFn: async () => {
      const flavors = await client.models.Flavor.list({
        selectionSet: ["id", "itemId", "name", "available", "createdAt", "updatedAt"],
      });

      return flavors;
    },
  });
};

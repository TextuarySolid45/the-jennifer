import { useQuery } from "@tanstack/react-query";
import { useAmplifyClient } from "./useAmplifyClient";

export const useGetItems = () => {
  const client = useAmplifyClient();

  return useQuery({
    queryKey: ["items"],
    queryFn: async () => {
      const items = await client.models.Item.list({
        selectionSet: ["id", "name", "description", "deletedAt", "createdAt", "updatedAt"],
      });

      return {
        ...items,
        data: items.data.filter((item) => !item.deletedAt),
      };
    },
  });
};

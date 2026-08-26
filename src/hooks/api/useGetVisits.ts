import { useQuery } from "@tanstack/react-query";
import { useAmplifyClient } from "./useAmplifyClient";

export const useGetVisits = () => {
  const client = useAmplifyClient();

  return useQuery({
    queryKey: ["visits"],
    queryFn: async () => {
      const visits = await client.models.Visit.list({
        selectionSet: ["id", "startDate", "endDate", "label", "createdAt", "updatedAt"],
      });

      return visits;
    },
  });
};

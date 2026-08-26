import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAmplifyClient } from "./useAmplifyClient";

export type CreateVisitInput = {
  startDate: string;
  endDate: string;
  label?: string;
};

export const useCreateVisit = () => {
  const client = useAmplifyClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateVisitInput) => {
      const newVisit = await client.models.Visit.create(input);

      if (!newVisit.data?.id) {
        throw new Error("Unable to create visit");
      }

      return newVisit.data.id;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["visits"] });
    },
  });
};

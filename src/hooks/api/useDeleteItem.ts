import { useMutation } from "@tanstack/react-query";
import { useAmplifyClient } from "./useAmplifyClient";

export const useDeleteItem = ({
  onError,
  onSuccess,
}: {
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const client = useAmplifyClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      try {
        await client.models.Item.update({
          id,
          deletedAt: new Date().toISOString(),
        });

        return true;
      } catch (error) {
        console.log("Error soft deleting item:", error);
        return false;
      }
    },
    onError,
    onSuccess,
  });
};

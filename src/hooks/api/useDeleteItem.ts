import { useMutation } from "@tanstack/react-query";
import { useAmplifyClient } from "./useAmplifyClient";
import { remove } from "aws-amplify/storage";

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
        await client.models.Item.delete({ id });

        await remove({
          path: `items/${id}/`,
        });

        return true;
      } catch (error) {
        console.log("Error deleting item:", error);
        return false;
      }
    },
    onError,
    onSuccess,
  });
};

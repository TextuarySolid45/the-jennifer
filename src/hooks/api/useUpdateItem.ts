import { useMutation } from "@tanstack/react-query";
import { uploadData } from "aws-amplify/storage";
import { useAmplifyClient } from "./useAmplifyClient";

export const useUpdateItem = ({
  onError,
  onSuccess,
}: {
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const client = useAmplifyClient();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      description,
      picture,
    }: {
      id: string;
      name: string;
      description: string;
      picture?: File;
    }) => {
      await client.models.Item.update({
        id,
        name,
        description,
      });

      if (picture) {
        await uploadData({
          path: `items/${id}/image.jpg`,
          data: picture,
        }).result;
      }

      return id;
    },
    onError,
    onSuccess,
  });
};

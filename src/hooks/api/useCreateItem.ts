import {
  useMutation,
  type MutationFunctionContext,
} from "@tanstack/react-query";
import { useAmplifyClient } from "./useAmplifyClient";
import { uploadData } from "aws-amplify/storage";

export const useCreateItem = ({
  onError,
  onSuccess,
}: {
  onSuccess?:
    | ((
        data: string | undefined,
        variables: {
          name: string;
          description: string;
          picture: File;
        },
        onMutateResult: unknown,
        context: MutationFunctionContext,
      ) => Promise<unknown> | unknown)
    | undefined;
  onError?:
    | ((
        error: Error,
        variables: {
          name: string;
          description: string;
          picture: File;
        },
        onMutateResult: unknown,
        context: MutationFunctionContext,
      ) => Promise<unknown> | unknown)
    | undefined;
}) => {
  const client = useAmplifyClient();

  return useMutation({
    mutationFn: async ({
      name,
      description,
      picture,
    }: {
      name: string;
      description: string;
      picture: File;
    }) => {
      const newItem = await client.models.Item.create({
        name,
        description,
      });

      if (newItem.data?.id) {
        await uploadData({
          path: `items/${newItem.data.id}/image.jpg`,
          data: picture,
        }).result;
      }

      return newItem.data?.id;
    },
    onError,
    onSuccess,
  });
};

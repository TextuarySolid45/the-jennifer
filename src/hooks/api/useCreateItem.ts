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
      picture
    }: {
      name: string;
      description: string;
      picture: File;
    }) => {
      const newItem = await client.models.Item.create({
        name: name,
        description: description,
      });

    if(newItem.data?.id){
        uploadData({
            path:`items/${newItem}/image.jpg`,
            data : picture,
        })
    }
      return newItem.data?.id;
    },
    onError,
    onSuccess,
  });
};

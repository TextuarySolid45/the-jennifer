import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormLabel,
  Input,
} from "@mui/material";
import { useCreateItem } from "../../hooks/api/useCreateItem";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { uploadData } from "aws-amplify/storage";
import { useQueryClient } from "@tanstack/react-query";
import { useDeleteItem } from "../../hooks/api/useDeleteItem";

const schema = yup
  .object({
    name: yup.string().required(),
    description: yup.string().required(),
    picture: yup.mixed().required(),
  })
  .required();

export const NewMenuItemModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const qc = useQueryClient();

  const { control, handleSubmit, reset, formState, getValues } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      picture: undefined,
    },
    mode: "onChange",
  });

  const { mutateAsync, isPending } = useCreateItem({
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items"] });
      onClose();
    },
  });




  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>New Menu Item</DialogTitle>
      <Divider />
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "25vw",
          height: "25vh",
        }}
      >
        <form>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormLabel>Name</FormLabel>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Input {...field} value={field.value ?? ""} />
              )}
            />
            {formState.errors.name && (
              <Box sx={{ color: "red" }}>{formState.errors.name.message}</Box>
            )}

            <FormLabel>Description</FormLabel>
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <Input {...field} value={field.value ?? ""} />
              )}
            />
            {formState.errors.description && (
              <Box sx={{ color: "red" }}>
                {formState.errors.description.message}
              </Box>
            )}

            <FormLabel>Picture</FormLabel>
            <Controller
              control={control}
              name="picture"
              render={({ field: { onChange, onBlur, name, ref } }) => (
                <Input
                  type="file"
                  name={name}
                  inputRef={ref}
                  onBlur={onBlur}
                  onChange={(event) => {
                    const file = (event.target as HTMLInputElement).files?.[0];
                    onChange(file);
                  }}
                  slotProps={{
                    input: {
                      accept: "image/*",
                    },
                  }}
                />
              )}
            />
            {formState.errors.picture && (
              <Box sx={{ color: "red" }}>
                {formState.errors.picture.message}
              </Box>
            )}
          </Box>
        </form>
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button
          color="error"
          variant="contained"
          onClick={() => {
            reset();
            onClose();
          }}
        >
          Cancel
        </Button>
        <Button
          disabled={isPending || !formState.isValid}
          color="success"
          variant="outlined"
          onClick={handleSubmit(async ({ name, description }) => {
            await mutateAsync({
              name,
              description,
              picture: getValues("picture") as File,
            });
            reset();
          })}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

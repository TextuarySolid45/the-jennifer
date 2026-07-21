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
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useUpdateItem } from "../../hooks/api/useUpdateItem";

const schema = yup
  .object({
    name: yup.string().required(),
    description: yup.string().required(),
    picture: yup.mixed<File>().nullable().notRequired(),
  })
  .required();

export const UpdateMenuItemModal = ({
  open,
  onClose,
  item,
}: {
  open: boolean;
  onClose: () => void;
  item: {
    id: string;
    name: string;
    description: string;
  } | null;
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

  useEffect(() => {
    if (open && item) {
      reset({
        name: item.name,
        description: item.description,
        picture: undefined,
      });
    }
  }, [item, open, reset]);

  const { mutateAsync: updateItem, isPending } = useUpdateItem({
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items"] });
      onClose();
    },
  });

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Update Menu Item</DialogTitle>
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
              render={({ field }) => <Input {...field} value={field.value ?? ""} />}
            />
            {formState.errors.name && <Box sx={{ color: "red" }}>{formState.errors.name.message}</Box>}

            <FormLabel>Description</FormLabel>
            <Controller
              control={control}
              name="description"
              render={({ field }) => <Input {...field} value={field.value ?? ""} />}
            />
            {formState.errors.description && (
              <Box sx={{ color: "red" }}>{formState.errors.description.message}</Box>
            )}

            <FormLabel>Update Picture? Optional</FormLabel>
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
            {formState.errors.picture && <Box sx={{ color: "red" }}>{formState.errors.picture.message}</Box>}
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
          disabled={isPending || !formState.isValid || !item}
          color="success"
          variant="outlined"
          onClick={handleSubmit(async ({ name, description }) => {
            if (!item?.id) {
              return;
            }

            await updateItem({
              id: item.id,
              name,
              description,
              picture: getValues("picture") ?? undefined,
            });
            reset();
          })}
        >
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};

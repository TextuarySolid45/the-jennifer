import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  FormLabel,
  Input,
  Switch,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useUpdateItem } from "../../hooks/api/useUpdateItem";
import { useCreateFlavor } from "../../hooks/api/useCreateFlavor";
import { useUpdateFlavor } from "../../hooks/api/useUpdateFlavor";
import type { FlavorRecord } from "./Menu";

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
    flavors: FlavorRecord[];
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
          maxHeight: "70vh",
          overflowY: "auto",
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

        <Divider sx={{ my: 2 }} />

        {item && <FlavorEditor key={`${item.id}-${open}`} itemId={item.id} initialFlavors={item.flavors} />}
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

// Keyed by `${itemId}-${open}` in the parent so this remounts (and its draft state resets)
// each time the dialog opens for an item, instead of syncing existing state via a useEffect.
const FlavorEditor = ({
  itemId,
  initialFlavors,
}: {
  itemId: string;
  initialFlavors: FlavorRecord[];
}) => {
  const [flavorDrafts, setFlavorDrafts] = useState<FlavorRecord[]>(initialFlavors);
  const [newFlavorName, setNewFlavorName] = useState("");

  const { mutateAsync: createFlavor, isPending: isCreatingFlavor } = useCreateFlavor();
  const { mutateAsync: updateFlavor } = useUpdateFlavor();

  return (
    <>
      <FormLabel>Flavors</FormLabel>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1 }}>
        {flavorDrafts.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No flavors yet. This item orders as-is with one tap.
          </Typography>
        )}

        {flavorDrafts.map((flavor, index) => (
          <Box key={flavor.id} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Input
              value={flavor.name}
              onChange={(event) => {
                const name = event.target.value;
                setFlavorDrafts((drafts) =>
                  drafts.map((draft, draftIndex) => (draftIndex === index ? { ...draft, name } : draft)),
                );
              }}
              onBlur={async () => {
                const trimmed = flavorDrafts[index].name.trim();
                if (trimmed) {
                  await updateFlavor({ id: flavor.id, name: trimmed });
                }
              }}
              sx={{ flex: 1 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={flavor.available}
                  onChange={async (event) => {
                    const available = event.target.checked;
                    setFlavorDrafts((drafts) =>
                      drafts.map((draft, draftIndex) =>
                        draftIndex === index ? { ...draft, available } : draft,
                      ),
                    );
                    await updateFlavor({ id: flavor.id, available });
                  }}
                />
              }
              label="Available"
              sx={{ whiteSpace: "nowrap" }}
            />
          </Box>
        ))}

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Input
            placeholder="New flavor name"
            value={newFlavorName}
            onChange={(event) => setNewFlavorName(event.target.value)}
            sx={{ flex: 1 }}
          />
          <Button
            disabled={!newFlavorName.trim() || isCreatingFlavor}
            onClick={async () => {
              const name = newFlavorName.trim();
              const newFlavorId = await createFlavor({ itemId, name });
              setFlavorDrafts((drafts) => [...drafts, { id: newFlavorId, name, available: true }]);
              setNewFlavorName("");
            }}
          >
            Add
          </Button>
        </Box>
      </Box>
    </>
  );
};

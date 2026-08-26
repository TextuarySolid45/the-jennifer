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
import { useCreateVisit } from "../../hooks/api/useCreateVisit";

const schema = yup
  .object({
    startDate: yup.string().required("Start date is required"),
    endDate: yup
      .string()
      .required("End date is required")
      .test(
        "is-after-start",
        "End date can't be before the start date",
        (endDate, context) => !endDate || !context.parent.startDate || endDate >= context.parent.startDate,
      ),
    label: yup.string().optional(),
  })
  .required();

export const NewVisitModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { control, handleSubmit, reset, formState } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      startDate: "",
      endDate: "",
      label: "",
    },
    mode: "onChange",
  });

  const { mutateAsync: createVisit, isPending } = useCreateVisit();

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>New Visit</DialogTitle>
      <Divider />
      <DialogContent sx={{ display: "flex", flexDirection: "column", width: "25vw", minWidth: 280 }}>
        <form>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormLabel>Arriving</FormLabel>
            <Controller
              control={control}
              name="startDate"
              render={({ field }) => <Input {...field} type="date" value={field.value ?? ""} />}
            />
            {formState.errors.startDate && (
              <Box sx={{ color: "red" }}>{formState.errors.startDate.message}</Box>
            )}

            <FormLabel>Leaving</FormLabel>
            <Controller
              control={control}
              name="endDate"
              render={({ field }) => <Input {...field} type="date" value={field.value ?? ""} />}
            />
            {formState.errors.endDate && <Box sx={{ color: "red" }}>{formState.errors.endDate.message}</Box>}

            <FormLabel>Label (optional)</FormLabel>
            <Controller
              control={control}
              name="label"
              render={({ field }) => (
                <Input {...field} value={field.value ?? ""} placeholder="e.g. Labor Day trip" />
              )}
            />
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
          onClick={handleSubmit(async ({ startDate, endDate, label }) => {
            await createVisit({ startDate, endDate, label: label || undefined });
            reset();
            onClose();
          })}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

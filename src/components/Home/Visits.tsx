import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddCircleTwoToneIcon from "@mui/icons-material/AddCircleTwoTone";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { useState } from "react";
import { NewVisitModal } from "./NewVisitModal";
import { ConfirmModal } from "../ConfirmModal";
import { useDeleteVisit } from "../../hooks/api/useDeleteVisit";

export type VisitRecord = {
  id: string;
  startDate: string;
  endDate: string;
  label: string | null;
};

const formatDateRange = (visit: VisitRecord) => {
  if (visit.startDate === visit.endDate) {
    return visit.startDate;
  }

  return `${visit.startDate} – ${visit.endDate}`;
};

export const Visits = ({ visits }: { visits: VisitRecord[] }) => {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);
  const canManageVisits = authStatus === "authenticated";

  const [openNewVisitModal, setOpenNewVisitModal] = useState(false);
  const [visitPendingDelete, setVisitPendingDelete] = useState<string | null>(null);

  const { mutateAsync: deleteVisit } = useDeleteVisit();

  const sortedVisits = [...visits].sort((a, b) => a.startDate.localeCompare(b.startDate));

  return (
    <>
      <Accordion sx={{ width: "100%", mt: 2 }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            "& .MuiAccordionSummary-content": {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            },
          }}
        >
          <Typography variant="h2" sx={{ fontSize: { xs: "1.35rem", md: "3rem" } }}>
            Visits ({sortedVisits.length})
          </Typography>

          {canManageVisits && (
            <IconButton
              // See Menu.tsx's matching comment: avoids an invalid <button> nested
              // inside AccordionSummary's own <button>.
              component="span"
              onClick={(event) => {
                setOpenNewVisitModal(true);
                event.stopPropagation();
              }}
            >
              <AddCircleTwoToneIcon fontSize="large" />
            </IconButton>
          )}
        </AccordionSummary>
        <AccordionDetails>
          {sortedVisits.length === 0 && (
            <Typography variant="body1">No visits scheduled yet.</Typography>
          )}

          {sortedVisits.map((visit) => (
            <Paper
              key={visit.id}
              sx={{
                p: 2,
                mb: 1.5,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="h6">{visit.label || "Visit"}</Typography>
                <Typography variant="body2">{formatDateRange(visit)}</Typography>
              </Box>

              {canManageVisits && (
                <Tooltip title="Delete visit">
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => setVisitPendingDelete(visit.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Paper>
          ))}
        </AccordionDetails>
      </Accordion>

      <NewVisitModal open={openNewVisitModal} onClose={() => setOpenNewVisitModal(false)} />

      <ConfirmModal
        open={Boolean(visitPendingDelete)}
        onClose={() => setVisitPendingDelete(null)}
        title="Confirm Delete Visit"
        message="Are you sure you would like to delete this visit? Orders assigned to it will become unassigned."
        onConfirm={async () => {
          if (!visitPendingDelete) {
            return;
          }

          await deleteVisit({ id: visitPendingDelete });
          setVisitPendingDelete(null);
        }}
      />
    </>
  );
};

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddCircleTwoToneIcon from "@mui/icons-material/AddCircleTwoTone";
import { useAuthenticator } from "@aws-amplify/ui-react";
import type { OrderStatus } from "../../hooks/api/useUpdateOrderStatus";

const STATUS_OPTIONS: OrderStatus[] = [
  "ORDERING",
  "ORDERED",
  "PREPARING",
  "READY",
  "DELIVERING",
  "DELIVERED",
];

export type ActiveOrderRecord = {
  id: string;
  name: string;
  household: string;
  expectedDeliveryDate: string;
  status: OrderStatus | null;
  visitId: string | null;
};

export type VisitOption = {
  id: string;
  label: string;
};

export const OrdersAccordion = ({
  activeOrders,
  visitOptions,
  selectedOrderId,
  onSelectOrder,
  onCreateOrder,
  onUpdateStatus,
  onAssignVisit,
}: {
  activeOrders: ActiveOrderRecord[];
  visitOptions: VisitOption[];
  selectedOrderId: string | null;
  onSelectOrder: (orderId: string) => void;
  onCreateOrder: () => Promise<void>;
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  onAssignVisit: (orderId: string, visitId: string | null) => Promise<void>;
}) => {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);
  const canUpdateStatus = authStatus === "authenticated";
  const visitLookup = new Map(visitOptions.map((visit) => [visit.id, visit.label]));

  return (
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
          Orders ({activeOrders.length})
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            // See Menu.tsx's matching comment: avoids an invalid <button> nested
            // inside AccordionSummary's own <button>.
            component="span"
            onClick={async (event) => {
              event.stopPropagation();
              await onCreateOrder();
            }}
          >
            <AddCircleTwoToneIcon fontSize="large" />
          </IconButton>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {activeOrders.length === 0 && <Typography variant="body1">No active orders yet.</Typography>}

        {activeOrders.map((order) => {
          const isSelected = order.id === selectedOrderId;

          return (
            <Paper
              key={order.id}
              onClick={() => onSelectOrder(order.id)}
              sx={{
                p: 2,
                mb: 1.5,
                cursor: "pointer",
                border: isSelected ? "2px solid" : "1px solid",
                borderColor: isSelected ? "primary.main" : "divider",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                <Box>
                  <Typography variant="h6">{order.name}</Typography>
                  <Typography variant="body2">Household: {order.household}</Typography>
                  <Typography variant="body2">Delivery: {order.expectedDeliveryDate}</Typography>

                  {canUpdateStatus ? (
                    <TextField
                      label="Visit"
                      size="small"
                      select
                      value={order.visitId ?? ""}
                      onClick={(event) => event.stopPropagation()}
                      onChange={async (event) => {
                        await onAssignVisit(order.id, event.target.value || null);
                      }}
                      sx={{ minWidth: 180, mt: 1, backgroundColor: "#F6F1E8" }}
                    >
                      <MenuItem value="">Unassigned</MenuItem>
                      {visitOptions.map((visit) => (
                        <MenuItem key={visit.id} value={visit.id}>
                          {visit.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  ) : (
                    order.visitId &&
                    visitLookup.has(order.visitId) && (
                      <Chip
                        size="small"
                        sx={{ mt: 1 }}
                        label={`Visit: ${visitLookup.get(order.visitId)}`}
                      />
                    )
                  )}
                </Box>

                {canUpdateStatus ? (
                  <TextField
                    label="Status"
                    size="small"
                    select
                    value={(order.status ?? "ORDERING") as OrderStatus}
                    onClick={(event) => event.stopPropagation()}
                    onChange={async (event) => {
                      await onUpdateStatus(order.id, event.target.value as OrderStatus);
                    }}
                    sx={{ minWidth: 180, backgroundColor: "#F6F1E8"}}
                  >
                    {STATUS_OPTIONS.map((statusOption) => (
                      <MenuItem key={statusOption} value={statusOption}>
                        {statusOption}
                      </MenuItem>
                    ))}
                  </TextField>
                ) : (
                  <Chip label={order.status ?? "ORDERING"} sx={{ alignSelf: "flex-start" }} />
                )}
              </Box>
            </Paper>
          );
        })}
      </AccordionDetails>
    </Accordion>
  );
};

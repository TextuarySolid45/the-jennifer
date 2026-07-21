import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddCircleTwoToneIcon from "@mui/icons-material/AddCircleTwoTone";
import type { OrderStatus } from "../../hooks/api/useUpdateOrderStatus";

const STATUS_OPTIONS: OrderStatus[] = ["ORDERED", "PREPARING", "READY", "DELIVERING", "DELIVERED"];

export type ActiveOrderRecord = {
  id: string;
  name: string;
  household: string;
  expectedDeliveryDate: string;
  status: OrderStatus | null;
};

export const OrdersAccordion = ({
  activeOrders,
  selectedOrderId,
  onSelectOrder,
  onCreateOrder,
  onUpdateStatus,
}: {
  activeOrders: ActiveOrderRecord[];
  selectedOrderId: string | null;
  onSelectOrder: (orderId: string) => void;
  onCreateOrder: () => Promise<void>;
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
}) => {
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
        <Typography variant="h2" sx={{ fontSize: { xs: "1.35rem", md: "3rem" } }}>Orders ({activeOrders.length})</Typography>
        <IconButton
          onClick={async (event) => {
            event.stopPropagation();
            await onCreateOrder();
          }}
        >
          <AddCircleTwoToneIcon fontSize="large" />
        </IconButton>
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
                </Box>

                <TextField
                  label="Status"
                  size="small"
                  select
                  value={(order.status ?? "ORDERED") as OrderStatus}
                  onClick={(event) => event.stopPropagation()}
                  onChange={async (event) => {
                    await onUpdateStatus(order.id, event.target.value as OrderStatus);
                  }}
                  sx={{ minWidth: 180 }}
                >
                  {STATUS_OPTIONS.map((statusOption) => (
                    <MenuItem key={statusOption} value={statusOption}>
                      {statusOption}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Paper>
          );
        })}
      </AccordionDetails>
    </Accordion>
  );
};

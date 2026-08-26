import { Accordion, AccordionDetails, AccordionSummary, Box, Chip, Paper, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export type PastOrderRecord = {
  id: string;
  name: string;
  household: string;
  expectedDeliveryDate: string;
  visitId: string | null;
};

export type PastVisitOption = {
  id: string;
  label: string;
};

export const PastOrdersAccordion = ({
  deliveredOrders,
  visitOptions,
}: {
  deliveredOrders: PastOrderRecord[];
  visitOptions: PastVisitOption[];
}) => {
  const visitLookup = new Map(visitOptions.map((visit) => [visit.id, visit.label]));

  return (
    <Accordion sx={{ width: "100%", mt: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h2" sx={{ fontSize: { xs: "1.35rem", md: "3rem" } }}>Past Orders ({deliveredOrders.length})</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {deliveredOrders.length === 0 && <Typography variant="body1">No delivered orders yet.</Typography>}

        {deliveredOrders.map((order) => (
          <Paper key={order.id} sx={{ p: 2, mb: 1.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
              <Box>
                <Typography variant="h6">{order.name}</Typography>
                <Typography variant="body2">Household: {order.household}</Typography>
                <Typography variant="body2">Delivery: {order.expectedDeliveryDate}</Typography>
                {order.visitId && visitLookup.has(order.visitId) && (
                  <Chip size="small" sx={{ mt: 0.5 }} label={`Visit: ${visitLookup.get(order.visitId)}`} />
                )}
              </Box>
              <Chip label="DELIVERED" color="success" />
            </Box>
          </Paper>
        ))}
      </AccordionDetails>
    </Accordion>
  );
};

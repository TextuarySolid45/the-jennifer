import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

const ORDER_PANEL_WIDTH = 380;

export type OrderSidePanelItem = {
  id: string;
  itemId: string | null;
  quantity: number;
};

export type ItemLookupRecord = {
  id: string;
  name: string;
};

export const OrderSidePanel = ({
  isOpen,
  order,
  orderItems,
  itemLookup,
  totalItems,
  onClose,
  onDeleteOrder,
  onIncrease,
  onDecrease,
  onRemove,
}: {
  isOpen: boolean;
  order: {
    id: string;
    name: string;
    household: string;
  } | null;
  orderItems: OrderSidePanelItem[];
  itemLookup: Map<string, ItemLookupRecord>;
  totalItems: number;
  onClose: () => void;
  onDeleteOrder: (orderId: string) => Promise<void>;
  onIncrease: (orderItemId: string, quantity: number) => Promise<void>;
  onDecrease: (orderItemId: string, quantity: number) => Promise<void>;
  onRemove: (orderItemId: string) => Promise<void>;
}) => {
  if (!order || !isOpen) {
    return null;
  }

  return (
    <Paper
      elevation={4}
      sx={{
        width: { xs: "calc(100% - 16px)", md: ORDER_PANEL_WIDTH },
        border: "1px solid",
        borderColor: "divider",
        boxSizing: "border-box",
        p: { xs: 1.5, md: 2 },
        backgroundColor: { xs: "rgba(246, 241, 232, 0.92)", md: "background.paper" },
        backdropFilter: { xs: "blur(4px)", md: "none" },
        position: { xs: "fixed", md: "sticky" },
        bottom: { xs: 8, md: "auto" },
        left: { xs: 8, md: "auto" },
        right: { xs: 8, md: "auto" },
        top: { xs: "auto", md: 12 },
        borderRadius: { xs: 3, md: 2 },
        maxHeight: { xs: "200px", md: "calc(100vh - 120px)" },
        overflowY: "auto",
        zIndex: { xs: 1200, md: 1 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
          pr: { xs: 0.5, md: 0 },
          pl: { xs: 0.25, md: 0 },
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: "0.85rem", md: "1.5rem" },
            fontWeight: { xs: 600, md: 500 },
            lineHeight: 1.2,
          }}
        >
          New Order
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Tooltip title="Delete order">
            <IconButton
              color="error"
              size="small"
              onClick={async () => {
                await onDeleteOrder(order.id);
              }}
              sx={{ display: { xs: "inline-flex", md: "none" } }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>

          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <Typography variant="body2" sx={{ mb: 1.5, display: { xs: "none", md: "block" } }}>
        {`${order.name} (${order.household})`}
      </Typography>

      <Divider sx={{ mb: { xs: 1, md: 2 } }} />

      <Chip label={`${totalItems} items`} color="primary" sx={{ mb: { xs: 1, md: 2 } }} />

      <Button
        color="error"
        variant="outlined"
        fullWidth
        sx={{ mb: 2, display: { xs: "none", md: "inline-flex" } }}
        onClick={async () => {
          await onDeleteOrder(order.id);
        }}
      >
        Delete Order
      </Button>

      {orderItems.length === 0 && (
        <Typography variant="body2">No items yet. Add items from the menu.</Typography>
      )}

      {orderItems.length > 0 && (
        <List sx={{ width: "100%", py: { xs: 0, md: 1 } }}>
          {orderItems.map((orderItem) => {
            const itemId = orderItem.itemId ?? "";
            const item = itemLookup.get(itemId);

            return (
              <ListItem
                key={orderItem.id}
                disablePadding
                sx={{
                  mb: 1,
                  p: { xs: 0.75, md: 1 },
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <ListItemText
                  primary={
                    <Typography sx={{ fontSize: { xs: "0.85rem", md: "1rem" }, lineHeight: 1.2 }}>
                      {item?.name ?? "Unknown Item"}
                    </Typography>
                  }
                  secondary={
                    <Typography sx={{ fontSize: { xs: "0.75rem", md: "0.875rem" } }}>
                      {`Qty: ${orderItem.quantity}`}
                    </Typography>
                  }
                  sx={{ mr: 1 }}
                />

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
                  <IconButton
                    size="small"
                    onClick={async () => {
                      await onDecrease(orderItem.id, orderItem.quantity);
                    }}
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>

                  <Typography
                    variant="body2"
                    sx={{ width: 16, textAlign: "center", fontSize: { xs: "0.8rem", md: "0.95rem" } }}
                  >
                    {orderItem.quantity}
                  </Typography>

                  <IconButton
                    size="small"
                    onClick={async () => {
                      await onIncrease(orderItem.id, orderItem.quantity);
                    }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>

                  <IconButton
                    size="small"
                    color="error"
                    onClick={async () => {
                      await onRemove(orderItem.id);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </ListItem>
            );
          })}
        </List>
      )}
    </Paper>
  );
};

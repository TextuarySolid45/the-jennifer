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
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState } from "react";

const ORDER_PANEL_WIDTH = 380;

export type OrderSidePanelItem = {
  id: string;
  itemId: string | null;
  flavorId: string | null;
  quantity: number;
};

export type ItemLookupRecord = {
  id: string;
  name: string;
};

export type FlavorLookupRecord = {
  id: string;
  name: string;
};

export const OrderSidePanel = ({
  isOpen,
  order,
  orderItems,
  itemLookup,
  flavorLookup,
  totalItems,
  canCompleteOrder,
  onClose,
  onCompleteOrder,
  onDeleteOrder,
  onIncrease,
  onDecrease,
  onRemove,
  onUpdateName,
}: {
  isOpen: boolean;
  order: {
    id: string;
    name: string;
    household: string;
  } | null;
  orderItems: OrderSidePanelItem[];
  itemLookup: Map<string, ItemLookupRecord>;
  flavorLookup: Map<string, FlavorLookupRecord>;
  totalItems: number;
  canCompleteOrder: boolean;
  onClose: () => void;
  onCompleteOrder: (orderId: string) => Promise<void>;
  onDeleteOrder: (orderId: string) => Promise<void>;
  onIncrease: (orderItemId: string, quantity: number) => Promise<void>;
  onDecrease: (orderItemId: string, quantity: number) => Promise<void>;
  onRemove: (orderItemId: string) => Promise<void>;
  onUpdateName: (orderId: string, name: string) => Promise<void>;
}) => {
  if (!order || !isOpen) {
    return null;
  }

  return (
    // Keyed by order id so the name-draft state below resets when the
    // selected order changes, instead of syncing it via a useEffect.
    <OrderSidePanelContent
      key={order.id}
      order={order}
      orderItems={orderItems}
      itemLookup={itemLookup}
      flavorLookup={flavorLookup}
      totalItems={totalItems}
      canCompleteOrder={canCompleteOrder}
      onClose={onClose}
      onCompleteOrder={onCompleteOrder}
      onDeleteOrder={onDeleteOrder}
      onIncrease={onIncrease}
      onDecrease={onDecrease}
      onRemove={onRemove}
      onUpdateName={onUpdateName}
    />
  );
};

const OrderSidePanelContent = ({
  order,
  orderItems,
  itemLookup,
  flavorLookup,
  totalItems,
  canCompleteOrder,
  onClose,
  onCompleteOrder,
  onDeleteOrder,
  onIncrease,
  onDecrease,
  onRemove,
  onUpdateName,
}: {
  order: {
    id: string;
    name: string;
    household: string;
  };
  orderItems: OrderSidePanelItem[];
  itemLookup: Map<string, ItemLookupRecord>;
  flavorLookup: Map<string, FlavorLookupRecord>;
  totalItems: number;
  canCompleteOrder: boolean;
  onClose: () => void;
  onCompleteOrder: (orderId: string) => Promise<void>;
  onDeleteOrder: (orderId: string) => Promise<void>;
  onIncrease: (orderItemId: string, quantity: number) => Promise<void>;
  onDecrease: (orderItemId: string, quantity: number) => Promise<void>;
  onRemove: (orderItemId: string) => Promise<void>;
  onUpdateName: (orderId: string, name: string) => Promise<void>;
}) => {
  const [nameDraft, setNameDraft] = useState(order.name === "New Order" ? "" : order.name);

  const commitName = async () => {
    const trimmed = nameDraft.trim();

    if (trimmed && trimmed !== order.name) {
      await onUpdateName(order.id, trimmed);
    }
  };

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
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>

          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <TextField
        label="Your name"
        placeholder="Who's this order for?"
        size="small"
        fullWidth
        value={nameDraft}
        onChange={(event) => setNameDraft(event.target.value)}
        onBlur={commitName}
        sx={{ mb: 1.5 }}
      />

      <Box
        sx={{
          mb: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Chip
          label={`${totalItems} items`}
          color="primary"
          size="small"
          sx={{ display: "inline-flex", flexShrink: 0 }}
        />

        <Tooltip title={canCompleteOrder ? "" : "Add your name before completing the order"}>
          <span>
            <Button
              variant="contained"
              size="small"
              onClick={async () => {
                await commitName();
                await onCompleteOrder(order.id);
              }}
              disabled={!canCompleteOrder || !nameDraft.trim()}
            >
              Complete
            </Button>
          </span>
        </Tooltip>
      </Box>

      <Divider sx={{ mb: { xs: 1, md: 2 } }} />

      {orderItems.length === 0 && (
        <Typography variant="body2">No items yet. Add items from the menu.</Typography>
      )}

      {orderItems.length > 0 && (
        <List sx={{ width: "100%", py: { xs: 0, md: 1 } }}>
          {orderItems.map((orderItem) => {
            const itemId = orderItem.itemId ?? "";
            const item = itemLookup.get(itemId);
            const flavor = orderItem.flavorId ? flavorLookup.get(orderItem.flavorId) : undefined;
            const itemLabel = flavor ? `${item?.name ?? "Unknown Item"} — ${flavor.name}` : item?.name ?? "Unknown Item";

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
                      {itemLabel}
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

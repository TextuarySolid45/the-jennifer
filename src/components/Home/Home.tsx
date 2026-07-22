import { Box, CircularProgress } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { ConfirmModal } from "../ConfirmModal";
import { useAddItemToOrder } from "../../hooks/api/useAddItemToOrder";
import { useCreateOrder } from "../../hooks/api/useCreateOrder";
import { useDeleteOrder } from "../../hooks/api/useDeleteOrder";
import { useDeleteOrderItem } from "../../hooks/api/useDeleteOrderItem";
import { useGetItems } from "../../hooks/api/useGetItems";
import { useGetOrderItems } from "../../hooks/api/useGetOrderItems";
import { useGetOrders } from "../../hooks/api/useGetOrders";
import { useUpdateOrderItemQuantity } from "../../hooks/api/useUpdateOrderItemQuantity";
import type { OrderStatus } from "../../hooks/api/useUpdateOrderStatus";
import { useUpdateOrderStatus } from "../../hooks/api/useUpdateOrderStatus";
import { Menu } from "./Menu";
import { OrderSidePanel } from "./OrderSidePanel";
import { OrdersAccordion } from "./OrdersAccordion";
import { PastOrdersAccordion } from "./PastOrdersAccordion";

const getTodayDate = () => new Date().toISOString().slice(0, 10);

export const Home = () => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isOrderPanelOpen, setIsOrderPanelOpen] = useState(false);
  const [openDeleteOrderConfirm, setOpenDeleteOrderConfirm] = useState(false);

  const { data: itemsResponse, isLoading: isItemsLoading } = useGetItems();
  const { data: ordersResponse, isLoading: isOrdersLoading } = useGetOrders();
  const { data: orderItemsResponse, isLoading: isOrderItemsLoading } = useGetOrderItems();

  const createOrder = useCreateOrder();
  const addItemToOrder = useAddItemToOrder();
  const updateOrderItemQuantity = useUpdateOrderItemQuantity();
  const deleteOrderItem = useDeleteOrderItem();
  const deleteOrder = useDeleteOrder();
  const updateOrderStatus = useUpdateOrderStatus();

  const items = itemsResponse?.data ?? [];
  const orders = ordersResponse?.data ?? [];
  const orderItems = orderItemsResponse?.data ?? [];

  const activeOrders = useMemo(
    () => orders.filter((order) => order.status !== "DELIVERED"),
    [orders],
  );

  const deliveredOrders = useMemo(
    () => orders.filter((order) => order.status === "DELIVERED"),
    [orders],
  );

  useEffect(() => {
    if (!selectedOrderId && activeOrders.length > 0) {
      setSelectedOrderId(activeOrders[0].id);
      return;
    }

    if (
      selectedOrderId &&
      activeOrders.length > 0 &&
      !activeOrders.some((order) => order.id === selectedOrderId)
    ) {
      setSelectedOrderId(activeOrders[0].id);
      return;
    }

    if (selectedOrderId && activeOrders.length === 0) {
      setSelectedOrderId(null);
      setIsOrderPanelOpen(false);
    }
  }, [activeOrders, selectedOrderId]);

  const selectedOrder = orders.find((order) => order.id === selectedOrderId) ?? null;

  const selectedOrderItems = useMemo(
    () => orderItems.filter((orderItem) => orderItem.orderId === selectedOrderId),
    [orderItems, selectedOrderId],
  );

  const selectedActiveOrder = useMemo(
    () => activeOrders.find((order) => order.id === selectedOrderId) ?? null,
    [activeOrders, selectedOrderId],
  );

  const itemLookup = useMemo(() => {
    return new Map(
      items.map((item) => [item.id, { id: item.id, name: item.name ?? "Unknown Item" }]),
    );
  }, [items]);

  const totalSelectedOrderItems = selectedOrderItems.reduce(
    (sum, orderItem) => sum + orderItem.quantity,
    0,
  );

  if (isItemsLoading || isOrdersLoading || isOrderItemsLoading) {
    return <CircularProgress />;
  }

  return (
    <Box
      sx={{
        width: "100%",
        pr: { xs: 0, md: 2 },
        pb: { xs: isOrderPanelOpen ? "220px" : 0, md: 0 },
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: 2,
        alignItems: "flex-start",
      }}
    >
      <Box sx={{ flex: 1, width: "100%", minWidth: 0 }}>
        <Menu
          items={items
            .filter((item) => Boolean(item.id))
            .map((item) => ({
              id: item.id,
              name: item.name ?? "",
              description: item.description ?? "",
            }))}
          isItemsLoading={isItemsLoading}
          onAddToOrder={async (item) => {
            const hasActiveSelectedOrder =
              !!selectedOrderId && activeOrders.some((order) => order.id === selectedOrderId);

            const targetOrderId = await addItemToOrder.mutateAsync({
              itemId: item.id,
              orderId: hasActiveSelectedOrder ? selectedOrderId : null,
            });

            if (!targetOrderId) {
              return;
            }

            setSelectedOrderId(targetOrderId);
            setIsOrderPanelOpen(true);
          }}
        />

        <OrdersAccordion
          activeOrders={activeOrders
            .filter((order) => Boolean(order.id))
            .map((order) => ({
              id: order.id,
              name: order.name ?? "New Order",
              household: order.household ?? "General",
              expectedDeliveryDate: order.expectedDeliveryDate ?? "",
              status: (order.status ?? "ORDERING") as OrderStatus,
            }))}
          selectedOrderId={selectedOrderId}
          onSelectOrder={(orderId) => {
            setSelectedOrderId(orderId);
            setIsOrderPanelOpen(true);
          }}
          onCreateOrder={async () => {
            const newOrderId = await createOrder.mutateAsync({
              name: "New Order",
              household: "General",
              expectedDeliveryDate: getTodayDate(),
              notes: "",
              status: "ORDERING",
            });

            setSelectedOrderId(newOrderId);
            setIsOrderPanelOpen(true);
          }}
          onUpdateStatus={async (orderId, status) => {
            await updateOrderStatus.mutateAsync({ id: orderId, status });
          }}
        />

        <PastOrdersAccordion
          deliveredOrders={deliveredOrders
            .filter((order) => Boolean(order.id))
            .map((order) => ({
              id: order.id,
              name: order.name ?? "Order",
              household: order.household ?? "General",
              expectedDeliveryDate: order.expectedDeliveryDate ?? "",
            }))}
        />
      </Box>

      {selectedOrder && (
        <ConfirmModal
          open={openDeleteOrderConfirm}
          onClose={() => setOpenDeleteOrderConfirm(false)}
          title="Confirm Delete Order"
          message="Are you sure you would like to delete this order?"
          onConfirm={async () => {
            await deleteOrder.mutateAsync({ id: selectedOrder.id });
            setOpenDeleteOrderConfirm(false);
            setIsOrderPanelOpen(false);
            setSelectedOrderId(null);
          }}
        />
      )}

      <OrderSidePanel
        isOpen={isOrderPanelOpen}
        order={
          selectedOrder
            ? {
                id: selectedOrder.id,
                name: selectedOrder.name ?? "New Order",
                household: selectedOrder.household ?? "General",
              }
            : null
        }
        orderItems={selectedOrderItems
          .filter((orderItem) => Boolean(orderItem.id))
          .map((orderItem) => ({
            id: orderItem.id,
            itemId: orderItem.itemId,
            quantity: orderItem.quantity,
          }))}
        itemLookup={itemLookup}
        totalItems={totalSelectedOrderItems}
        canCompleteOrder={selectedActiveOrder?.status === "ORDERING"}
        onClose={() => setIsOrderPanelOpen(false)}
        onCompleteOrder={async (orderId) => {
          await updateOrderStatus.mutateAsync({
            id: orderId,
            status: "ORDERED",
          });
          setIsOrderPanelOpen(false);
        }}
        onDeleteOrder={async () => {
          setOpenDeleteOrderConfirm(true);
        }}
        onIncrease={async (orderItemId, quantity) => {
          await updateOrderItemQuantity.mutateAsync({
            id: orderItemId,
            quantity: quantity + 1,
          });
        }}
        onDecrease={async (orderItemId, quantity) => {
          await updateOrderItemQuantity.mutateAsync({
            id: orderItemId,
            quantity: quantity - 1,
          });
        }}
        onRemove={async (orderItemId) => {
          await deleteOrderItem.mutateAsync({ id: orderItemId });
        }}
      />
    </Box>
  );
};

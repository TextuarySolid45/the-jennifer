import { Box, CircularProgress } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { ConfirmModal } from "../ConfirmModal";
import { useAddItemToOrder } from "../../hooks/api/useAddItemToOrder";
import { useCompleteOrder } from "../../hooks/api/useCompleteOrder";
import { useCreateOrder } from "../../hooks/api/useCreateOrder";
import { useDeleteOrder } from "../../hooks/api/useDeleteOrder";
import { useDeleteOrderItem } from "../../hooks/api/useDeleteOrderItem";
import { useGetFlavors } from "../../hooks/api/useGetFlavors";
import { useGetItems } from "../../hooks/api/useGetItems";
import { useGetOrderItems } from "../../hooks/api/useGetOrderItems";
import { useGetOrders } from "../../hooks/api/useGetOrders";
import { useGetVisits } from "../../hooks/api/useGetVisits";
import { useUpdateOrder } from "../../hooks/api/useUpdateOrder";
import { useUpdateOrderItemQuantity } from "../../hooks/api/useUpdateOrderItemQuantity";
import { useUpdateOrderStatus } from "../../hooks/api/useUpdateOrderStatus";
import { getEffectiveOrderStatus } from "../../util/orderStatus";
import { Menu } from "./Menu";
import { OrderSidePanel } from "./OrderSidePanel";
import { OrdersAccordion } from "./OrdersAccordion";
import { PastOrdersAccordion } from "./PastOrdersAccordion";
import { Visits } from "./Visits";

const formatVisitLabel = (visit: { startDate: string; endDate: string; label: string | null }) => {
  const dates = visit.startDate === visit.endDate ? visit.startDate : `${visit.startDate} – ${visit.endDate}`;
  return visit.label ? `${visit.label} (${dates})` : dates;
};

const getTodayDate = () => new Date().toISOString().slice(0, 10);

export const Home = () => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isOrderPanelOpen, setIsOrderPanelOpen] = useState(false);
  const [openDeleteOrderConfirm, setOpenDeleteOrderConfirm] = useState(false);

  const { data: itemsResponse, isLoading: isItemsLoading } = useGetItems();
  const { data: ordersResponse, isLoading: isOrdersLoading } = useGetOrders();
  const { data: orderItemsResponse, isLoading: isOrderItemsLoading } = useGetOrderItems();
  const { data: visitsResponse } = useGetVisits();
  const { data: flavorsResponse } = useGetFlavors();

  const createOrder = useCreateOrder();
  const addItemToOrder = useAddItemToOrder();
  const updateOrderItemQuantity = useUpdateOrderItemQuantity();
  const deleteOrderItem = useDeleteOrderItem();
  const deleteOrder = useDeleteOrder();
  const updateOrderStatus = useUpdateOrderStatus();
  const completeOrder = useCompleteOrder();
  const updateOrder = useUpdateOrder();

  const items = itemsResponse?.data ?? [];
  const orders = ordersResponse?.data ?? [];
  const orderItems = orderItemsResponse?.data ?? [];
  const visits = visitsResponse?.data ?? [];
  const flavors = flavorsResponse?.data ?? [];

  // Grouped with all flavors (available and not) — MenuItemCard filters to available-only
  // for the guest-facing chip picker, while UpdateMenuItemModal needs the full list so the
  // aunt can re-enable a flavor she previously toggled off.
  const flavorsByItemId = useMemo(() => {
    const map = new Map<string, { id: string; name: string; available: boolean }[]>();

    [...flavors]
      .filter((flavor) => Boolean(flavor.id) && Boolean(flavor.itemId))
      .sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""))
      .forEach((flavor) => {
        const itemId = flavor.itemId as string;
        const list = map.get(itemId) ?? [];
        list.push({ id: flavor.id, name: flavor.name ?? "", available: flavor.available ?? true });
        map.set(itemId, list);
      });

    return map;
  }, [flavors]);

  const flavorLookup = useMemo(
    () =>
      new Map(
        flavors
          .filter((flavor) => Boolean(flavor.id))
          .map((flavor) => [flavor.id, { id: flavor.id, name: flavor.name ?? "" }]),
      ),
    [flavors],
  );

  const visitOptions = useMemo(
    () =>
      visits
        .filter((visit) => Boolean(visit.id))
        .map((visit) => ({
          id: visit.id,
          label: formatVisitLabel({
            startDate: visit.startDate ?? "",
            endDate: visit.endDate ?? "",
            label: visit.label ?? null,
          }),
        })),
    [visits],
  );

  const activeOrders = useMemo(
    () => orders.filter((order) => getEffectiveOrderStatus(order) !== "DELIVERED"),
    [orders],
  );

  const deliveredOrders = useMemo(
    () => orders.filter((order) => getEffectiveOrderStatus(order) === "DELIVERED"),
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

  // Visits is intentionally excluded here: it's supplementary (the Menu/Orders/Past
  // Orders sections don't depend on it), so a slow or failing visits fetch shouldn't
  // block the whole page behind a spinner. It degrades gracefully to an empty list
  // (see `visits` above) until it resolves.
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
              flavors: flavorsByItemId.get(item.id) ?? [],
            }))}
          isItemsLoading={isItemsLoading}
          onAddToOrder={async (item, flavorId) => {
            const hasActiveSelectedOrder =
              !!selectedOrderId && activeOrders.some((order) => order.id === selectedOrderId);

            const targetOrderId = await addItemToOrder.mutateAsync({
              itemId: item.id,
              flavorId,
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
              status: getEffectiveOrderStatus(order),
              visitId: order.visitId ?? null,
            }))}
          visitOptions={visitOptions}
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
            });

            setSelectedOrderId(newOrderId);
            setIsOrderPanelOpen(true);
          }}
          onUpdateStatus={async (orderId, status) => {
            await updateOrderStatus.mutateAsync({ id: orderId, status });
          }}
          onAssignVisit={async (orderId, visitId) => {
            await updateOrder.mutateAsync({ id: orderId, visitId });
          }}
        />

        <Visits
          visits={visits
            .filter((visit) => Boolean(visit.id))
            .map((visit) => ({
              id: visit.id,
              startDate: visit.startDate ?? "",
              endDate: visit.endDate ?? "",
              label: visit.label ?? null,
            }))}
        />

        <PastOrdersAccordion
          deliveredOrders={deliveredOrders
            .filter((order) => Boolean(order.id))
            .map((order) => ({
              id: order.id,
              name: order.name ?? "Order",
              household: order.household ?? "General",
              expectedDeliveryDate: order.expectedDeliveryDate ?? "",
              visitId: order.visitId ?? null,
            }))}
          visitOptions={visitOptions}
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
            flavorId: orderItem.flavorId ?? null,
            quantity: orderItem.quantity,
          }))}
        itemLookup={itemLookup}
        flavorLookup={flavorLookup}
        totalItems={totalSelectedOrderItems}
        canCompleteOrder={
          !!selectedActiveOrder && getEffectiveOrderStatus(selectedActiveOrder) === "ORDERING"
        }
        onUpdateName={async (orderId, name) => {
          await updateOrder.mutateAsync({ id: orderId, name });
        }}
        onClose={() => setIsOrderPanelOpen(false)}
        onCompleteOrder={async (orderId) => {
          await completeOrder.mutateAsync({ id: orderId });
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

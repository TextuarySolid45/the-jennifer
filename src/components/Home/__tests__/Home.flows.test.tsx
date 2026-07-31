import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Home } from "../Home";

const state = vi.hoisted(() => ({
  items: [] as Array<{ id: string; name: string; description: string }>,
  orders: [] as Array<{
    id: string;
    name: string;
    household: string;
    expectedDeliveryDate: string;
    status: "ORDERING" | "ORDERED" | "PREPARING" | "READY" | "DELIVERING" | "DELIVERED";
  }>,
  orderItems: [] as Array<{ id: string; orderId: string; itemId: string; quantity: number }>,
}));

const mocks = vi.hoisted(() => ({
  createOrderMutateAsync: vi.fn(),
  addItemToOrderMutateAsync: vi.fn(),
  updateOrderStatusMutateAsync: vi.fn(),
  completeOrderMutateAsync: vi.fn(),
  updateOrderItemQuantityMutateAsync: vi.fn(),
  deleteOrderItemMutateAsync: vi.fn(),
  deleteOrderMutateAsync: vi.fn(),
}));

vi.mock("../../../hooks/api/useGetItems", () => ({
  useGetItems: () => ({ data: { data: state.items }, isLoading: false }),
}));

vi.mock("../../../hooks/api/useGetOrders", () => ({
  useGetOrders: () => ({ data: { data: state.orders }, isLoading: false }),
}));

vi.mock("../../../hooks/api/useGetOrderItems", () => ({
  useGetOrderItems: () => ({ data: { data: state.orderItems }, isLoading: false }),
}));

vi.mock("../../../hooks/api/useCreateOrder", () => ({
  useCreateOrder: () => ({ mutateAsync: mocks.createOrderMutateAsync }),
}));

vi.mock("../../../hooks/api/useAddItemToOrder", () => ({
  useAddItemToOrder: () => ({ mutateAsync: mocks.addItemToOrderMutateAsync }),
}));

vi.mock("../../../hooks/api/useUpdateOrderStatus", () => ({
  useUpdateOrderStatus: () => ({ mutateAsync: mocks.updateOrderStatusMutateAsync }),
}));

vi.mock("../../../hooks/api/useCompleteOrder", () => ({
  useCompleteOrder: () => ({ mutateAsync: mocks.completeOrderMutateAsync }),
}));

vi.mock("../../../hooks/api/useUpdateOrderItemQuantity", () => ({
  useUpdateOrderItemQuantity: () => ({ mutateAsync: mocks.updateOrderItemQuantityMutateAsync }),
}));

vi.mock("../../../hooks/api/useDeleteOrderItem", () => ({
  useDeleteOrderItem: () => ({ mutateAsync: mocks.deleteOrderItemMutateAsync }),
}));

vi.mock("../../../hooks/api/useDeleteOrder", () => ({
  useDeleteOrder: () => ({ mutateAsync: mocks.deleteOrderMutateAsync }),
}));

vi.mock("../Menu", () => ({
  Menu: ({ items }: { items: Array<{ id: string; name: string }> }) => (
    <section>
      <h2>Menu Mock</h2>
      {items.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </section>
  ),
}));

vi.mock("../OrdersAccordion", () => ({
  OrdersAccordion: ({
    activeOrders,
    onCreateOrder,
    onUpdateStatus,
  }: {
    activeOrders: Array<{ id: string; name: string }>;
    onCreateOrder: () => Promise<void>;
    onUpdateStatus: (
      orderId: string,
      status: "ORDERING" | "ORDERED" | "PREPARING" | "READY" | "DELIVERING" | "DELIVERED",
    ) => Promise<void>;
  }) => (
    <section>
      <h2>Orders Mock</h2>
      <button
        type="button"
        onClick={async () => {
          await onCreateOrder();
        }}
      >
        Create Order
      </button>
      {activeOrders.map((order) => (
        <div key={order.id}>
          <div>{order.name}</div>
          <button
            type="button"
            onClick={async () => {
              await onUpdateStatus(order.id, "PREPARING");
            }}
          >
            Set PREPARING {order.id}
          </button>
          <button
            type="button"
            onClick={async () => {
              await onUpdateStatus(order.id, "READY");
            }}
          >
            Set READY {order.id}
          </button>
          <button
            type="button"
            onClick={async () => {
              await onUpdateStatus(order.id, "DELIVERING");
            }}
          >
            Set DELIVERING {order.id}
          </button>
          <button
            type="button"
            onClick={async () => {
              await onUpdateStatus(order.id, "DELIVERED");
            }}
          >
            Set DELIVERED {order.id}
          </button>
        </div>
      ))}
    </section>
  ),
}));

vi.mock("../OrderSidePanel", () => ({
  OrderSidePanel: ({
    isOpen,
    order,
    onCompleteOrder,
  }: {
    isOpen: boolean;
    order: { id: string; name: string } | null;
    onCompleteOrder: (orderId: string) => Promise<void>;
  }) => {
    if (!isOpen || !order) {
      return null;
    }

    return (
      <section>
        <div>Selected Order: {order.name}</div>
        <button
          type="button"
          onClick={async () => {
            await onCompleteOrder(order.id);
          }}
        >
          Complete Current Order
        </button>
      </section>
    );
  },
}));

vi.mock("../PastOrdersAccordion", () => ({
  PastOrdersAccordion: ({ deliveredOrders }: { deliveredOrders: Array<{ id: string; name: string }> }) => (
    <section>
      <h2>Past Orders ({deliveredOrders.length})</h2>
      {deliveredOrders.map((order) => (
        <div key={order.id}>{order.name}</div>
      ))}
    </section>
  ),
}));

describe("Home flows", () => {
  beforeEach(() => {
    state.items = [
      { id: "item-1", name: "Burger", description: "Beef burger" },
      { id: "item-2", name: "Salad", description: "Green salad" },
    ];

    state.orders = [
      {
        id: "order-1",
        name: "Family Order",
        household: "General",
        expectedDeliveryDate: "2026-07-22",
        status: "ORDERING",
      },
    ];

    state.orderItems = [];

    vi.clearAllMocks();

    mocks.createOrderMutateAsync.mockImplementation(async () => {
      const id = "order-2";
      state.orders = [
        ...state.orders,
        {
          id,
          name: "New Order",
          household: "General",
          expectedDeliveryDate: "2026-07-22",
          status: "ORDERING",
        },
      ];
      return id;
    });

    mocks.updateOrderStatusMutateAsync.mockImplementation(
      async ({ id, status }: { id: string; status: (typeof state.orders)[number]["status"] }) => {
        state.orders = state.orders.map((entry) =>
          entry.id === id ? { ...entry, status } : entry,
        );
      },
    );

    mocks.completeOrderMutateAsync.mockImplementation(async ({ id }: { id: string }) => {
      state.orders = state.orders.map((entry) =>
        entry.id === id ? { ...entry, status: "ORDERED" } : entry,
      );
    });

    mocks.addItemToOrderMutateAsync.mockResolvedValue("order-1");
    mocks.updateOrderItemQuantityMutateAsync.mockResolvedValue(undefined);
    mocks.deleteOrderItemMutateAsync.mockResolvedValue(undefined);
    mocks.deleteOrderMutateAsync.mockResolvedValue(undefined);
  });

  it("shows the list of menu items", () => {
    render(<Home />);

    expect(screen.getByText("Burger")).toBeInTheDocument();
    expect(screen.getByText("Salad")).toBeInTheDocument();
  });

  it("creates an order, updates it, moves it through statuses, and shows it in past orders", async () => {
    const user = userEvent.setup();
    const view = render(<Home />);

    await user.click(screen.getByRole("button", { name: "Create Order" }));

    await waitFor(() => {
      expect(mocks.createOrderMutateAsync).toHaveBeenCalledTimes(1);
      expect(state.orders).toHaveLength(2);
    });

    await user.click(screen.getByRole("button", { name: "Complete Current Order" }));

    await waitFor(() => {
      expect(mocks.completeOrderMutateAsync).toHaveBeenCalledWith({
        id: "order-2",
      });
    });

    await user.click(screen.getByRole("button", { name: "Set PREPARING order-1" }));
    view.rerender(<Home />);
    await user.click(screen.getByRole("button", { name: "Set READY order-1" }));
    view.rerender(<Home />);
    await user.click(screen.getByRole("button", { name: "Set DELIVERING order-1" }));
    view.rerender(<Home />);
    await user.click(screen.getByRole("button", { name: "Set DELIVERED order-1" }));
    view.rerender(<Home />);

    await waitFor(() => {
      expect(mocks.updateOrderStatusMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ status: "PREPARING" }),
      );
      expect(mocks.updateOrderStatusMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ status: "READY" }),
      );
      expect(mocks.updateOrderStatusMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ status: "DELIVERING" }),
      );
      expect(mocks.updateOrderStatusMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ status: "DELIVERED" }),
      );
      expect(screen.getByText("Past Orders (1)")).toBeInTheDocument();
      expect(screen.getByText("Family Order")).toBeInTheDocument();
    });
  });
});

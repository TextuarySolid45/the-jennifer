import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NewMenuItemModal } from "../NewMenuItemModal";

const createItemMock = vi.fn();

vi.mock("../../../hooks/api/useCreateItem", () => ({
  useCreateItem: () => ({
    mutateAsync: createItemMock,
    isPending: false,
  }),
}));

describe("NewMenuItemModal", () => {
  it("creates a menu item from modal input", async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <NewMenuItemModal open onClose={vi.fn()} />
      </QueryClientProvider>,
    );

    const textInputs = screen.getAllByRole("textbox");
    await user.type(textInputs[0], "Spicy Tacos");
    await user.type(textInputs[1], "Corn tortilla with salsa");

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const picture = new File(["image-bytes"], "taco.jpg", { type: "image/jpeg" });
    await user.upload(fileInput, picture);

    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(createItemMock).toHaveBeenCalledWith({
        name: "Spicy Tacos",
        description: "Corn tortilla with salsa",
        picture,
      });
    });
  });
});


import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from "vitest";

import {
  render,
  screen,
  waitFor,
  cleanup,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import App from "./App";

describe("QuickBite Food Order App", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  // Test 1: Food menu displays correctly
  it("renders the food menu", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: /good food/i })
    ).toBeInTheDocument();

    expect(
      screen.getByText("Classic Burger")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Margherita Pizza")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Crispy French Fries")
    ).toBeInTheDocument();
  });

  // Test 2: Add food item to cart
  it("adds a food item to the cart", async () => {
    const user = userEvent.setup();

    render(<App />);

    const addButtons = screen.getAllByRole("button", {
      name: /add/i,
    });

    await user.click(addButtons[0]);

    // food items appears in both menu and cart
    expect(
      screen.getAllByText("Classic Burger").length
    ).toBeGreaterThan(1);

    expect(
      screen.getByText("₹149 each")
    ).toBeInTheDocument();

    expect(
      screen.getAllByText("₹149").length
    ).toBeGreaterThan(0);
  });

  // Test 3: quantity updates
  it("increases the quantity and updates the total", async () => {
    const user = userEvent.setup();

    render(<App />);

    const addButtons = screen.getAllByRole("button", {
      name: /add/i,
    });

    await user.click(addButtons[0]);

    await user.click(
      screen.getByRole("button", {
        name: /increase classic burger/i,
      })
    );

    expect(
      screen.getByRole("button", {
        name: /increase classic burger/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText("₹298")
    ).toBeInTheDocument();
  });

  // Test 4: Empty cart message validation
  it("shows the empty cart message when no items are added", () => {
    render(<App />);

    expect(
      screen.getByText(/your cart is empty/i)
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: /place order/i,
      })
    ).not.toBeInTheDocument();
  });

  // Test 5: Successfully order placement
  it("submits an order successfully", async () => {
    const user = userEvent.setup();

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        message: "Order created successfully",
        order: {
          id: 123,
          status: 1,
        },
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    render(<App />);

    const addButtons = screen.getAllByRole("button", {
      name: /add/i,
    });

    await user.click(addButtons[0]);

    await user.type(
      screen.getByPlaceholderText("Customer name"),
      "Test Customer"
    );

    await user.type(
      screen.getByPlaceholderText("Delivery address"),
      "Madurai"
    );

    await user.type(
      screen.getByPlaceholderText("Phone number"),
      "9876543210"
    );

    await user.click(
      screen.getByRole("button", {
        name: /place order/i,
      })
    );

    await waitFor(() => {
      expect(
        screen.getByRole("status")
      ).toHaveTextContent(/order placed successfully/i);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "https://food-order-backend-yvp4.onrender.com/api/orders",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
    );
  });
});


  // Test 6: Api failiure handling
  it("shows an error when the order API fails", async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          message: "Unable to place order",
        }),
      })
    );

    render(<App />);

    const addButtons = screen.getAllByRole("button", {
      name: /add/i,
    });

    await user.click(addButtons[0]);

    await user.type(
      screen.getByPlaceholderText("Customer name"),
      "Test Customer"
    );

    await user.type(
      screen.getByPlaceholderText("Delivery address"),
      "Madurai"
    );

    await user.type(
      screen.getByPlaceholderText("Phone number"),
      "9876543210"
    );

    await user.click(
      screen.getByRole("button", {
        name: /place order/i,
      })
    );

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(
        /unable to place order/i
      );
    });
  });


// Test 7: Validate an invalid order ID
it("shows an error for an invalid order ID", async () => {
  const user = userEvent.setup();

  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        order: {
          id: 123,
          status: 1,
        },
      }),
    })
  );

  render(<App />);

  const addButtons = screen.getAllByRole("button", {
    name: /add/i,
  });

  await user.click(addButtons[0]);

  await user.type(
    screen.getByPlaceholderText("Customer name"),
    "Test Customer"
  );

  await user.type(
    screen.getByPlaceholderText("Delivery address"),
    "Madurai"
  );

  await user.type(
    screen.getByPlaceholderText("Phone number"),
    "9876543210"
  );

  await user.click(
    screen.getByRole("button", {
      name: /place order/i,
    })
  );

  const orderIdInput = await screen.findByPlaceholderText(
    "Order ID"
  );

  await user.clear(orderIdInput);
  await user.type(orderIdInput, "abc");

  await user.click(
    screen.getByRole("button", {
      name: /track order/i,
    })
  );

  expect(
    await screen.findByText(/please enter a valid order id/i)
  ).toBeInTheDocument();
});


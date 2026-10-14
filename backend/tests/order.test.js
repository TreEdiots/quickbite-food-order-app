
const request = require("supertest");
const { app } = require("../server");
const { connectDB, getDB } = require("../config/db");

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  const db = getDB();
  await db.end();
});

describe("Order API Tests", () => {
  test("POST /api/orders - should reject missing customer details", async () => {
    const response = await request(app)
      .post("/api/orders")
      .send({
        customer_name: "",
        address: "",
        phone: "",
        items: [],
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Customer name, address, and phone are required"
    );
  });

  test("POST /api/orders - should reject an invalid phone number", async () => {
    const response = await request(app)
      .post("/api/orders")
      .send({
        customer_name: "Test Customer",
        address: "Madurai",
        phone: "12345",
        items: [{ item_name: "Burger", quantity: 1, price: 100 }],
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Phone number must contain exactly 10 digits"
    );
  });

  test("POST /api/orders - should reject an empty items array", async () => {
    const response = await request(app)
      .post("/api/orders")
      .send({
        customer_name: "Test Customer",
        address: "Madurai",
        phone: "9876543210",
        items: [],
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "At least one food item is required"
    );
  });

  test("POST /api/orders - should create a valid order", async () => {
    const response = await request(app)
      .post("/api/orders")
      .send({
        customer_name: "Test Customer",
        address: "Madurai",
        phone: "9876543210",
        items: [
          { item_name: "Burger", quantity: 2, price: 100 },
          { item_name: "Juice", quantity: 1, price: 50 },
        ],
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe("Order created successfully");
    expect(response.body.order.id).toBeDefined();
    expect(response.body.order.total_amount).toBe(250);
  });
});


  test("GET /api/orders/:id - should return order details", async () => {
    // Create an order for testing
    const createResponse = await request(app)
      .post("/api/orders")
      .send({
        customer_name: "GET Test",
        address: "Madurai",
        phone: "9876543210",
        items: [
          { item_name: "Pizza", quantity: 1, price: 200 },
        ],
      });

    const orderId = createResponse.body.order.id;

    const response = await request(app)
      .get(`/api/orders/${orderId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.order.id).toBe(orderId);
    expect(response.body.order.items).toHaveLength(1);
  });

  test("GET /api/orders/:id - should return 400 for invalid ID", async () => {
    const response = await request(app).get("/api/orders/abc");

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Invalid order ID");
  });

  test("GET /api/orders/:id - should return 404 for missing order", async () => {
    const response = await request(app).get("/api/orders/999999999");

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("Order not found");
  });

  test("PATCH /api/orders/:id/status - should update order status", async () => {
    const createResponse = await request(app)
      .post("/api/orders")
      .send({
        customer_name: "Status Test",
        address: "Madurai",
        phone: "9876543210",
        items: [
          { item_name: "Sandwich", quantity: 1, price: 100 },
        ],
      });

    const orderId = createResponse.body.order.id;

    const response = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .send({ status: 2 });

    expect(response.statusCode).toBe(200);
    expect(response.body.order.status).toBe(2);
  });


const { getDB } = require("../config/db");

// Create a new order

const createOrder = async (req, res) => {
  const db = getDB();
  let connection;

  try {
    const { customer_name, address, phone, items } = req.body || {};

    if (!customer_name || !address || !phone) {
      return res.status(400).json({
        message: "Customer name, address, and phone are required",
      });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        message: "Phone number must contain exactly 10 digits",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "At least one food item is required",
      });
    }

    for (const item of items) {
      if (
        !item.item_name ||
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) < 1 ||
        !Number.isFinite(Number(item.price)) ||
        Number(item.price) <= 0
      ) {
        return res.status(400).json({
          message: "Each item needs a name, positive quantity, and valid price",
        });
      }
    }

    const totalAmount = items.reduce(
      (sum, item) =>
        sum + Number(item.price) * Number(item.quantity),
      0
    );

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [orderResult] = await connection.query(
      `INSERT INTO orders (customer_name, address, phone)
       VALUES (?, ?, ?)`,
      [customer_name.trim(), address.trim(), phone]
    );

    const orderId = orderResult.insertId;

    for (const item of items) {
      await connection.query(
        `INSERT INTO order_items
         (order_id, item_name, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [
          orderId,
          item.item_name,
          Number(item.quantity),
          Number(item.price),
        ]
      );
    }

    await connection.commit();

    res.status(201).json({
      message: "Order created successfully",
      order: {
        id: orderId,
        customer_name,
        address,
        phone,
        items,
        total_amount: Number(totalAmount.toFixed(2)),
        status: "Order Received",
      },
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("Create order error:", error);

    res.status(500).json({
      message: "Failed to create order",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Get order by ID


const getOrderById = async (req, res) => {
  try {
    const db = getDB();
    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    // Automatically calculate status using created_at
    
await db.query(
  `UPDATE orders
   SET status = CASE
     WHEN TIMESTAMPDIFF(SECOND, created_at, CURRENT_TIMESTAMP) < 5 THEN 1
     WHEN TIMESTAMPDIFF(SECOND, created_at, CURRENT_TIMESTAMP) < 10 THEN 2
     WHEN TIMESTAMPDIFF(SECOND, created_at, CURRENT_TIMESTAMP) < 15 THEN 3
     ELSE 4
   END
   WHERE id = ?`,
  [orderId]
);

    // Get the updated order
    const [orders] = await db.query(
      "SELECT * FROM orders WHERE id = ?",
      [orderId]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Get order items
    const [items] = await db.query(
      `SELECT item_name, quantity, price
       FROM order_items
       WHERE order_id = ?`,
      [orderId]
    );

    const totalAmount = items.reduce(
      (sum, item) =>
        sum + Number(item.price) * Number(item.quantity),
      0
    );

    res.status(200).json({
      order: {
        ...orders[0],
        status: Number(orders[0].status),
        items,
        total_amount: Number(totalAmount.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Get order error:", error);

    res.status(500).json({
      message: "Failed to fetch order",
    });
  }
};

// Update order status

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Allow only status numbers 1, 2, 3, 4
    if (![1, 2, 3, 4].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Use 1, 2, 3, or 4.",
      });
    }

    const db = getDB();
    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const [result] = await db.query(
      "UPDATE orders SET status = ? WHERE id = ?",
      [status, orderId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const [orders] = await db.query(
      "SELECT * FROM orders WHERE id = ?",
      [orderId]
    );

    res.status(200).json({
      message: "Order status updated successfully",
      order: orders[0],
    });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({
      message: "Failed to update order status",
    });
  }
};


const getAllOrders = async (req, res) => {
  try {
    const db = getDB();

    const [orders] = await db.query(
      "SELECT * FROM orders ORDER BY id DESC"
    );

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({
      message: "Failed to fetch orders",
    });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const db = getDB();
    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const [result] = await db.query(
      "DELETE FROM orders WHERE id = ?",
      [orderId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({
      message: "Failed to delete order",
    });
  }
};



module.exports = {
  createOrder,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  deleteOrder,
};



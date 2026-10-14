
const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  deleteOrder,
} = require("../controllers/orderController");

router.post("/", createOrder);
router.get("/:id", getOrderById);
router.patch("/:id/status", updateOrderStatus);
router.get("/", getAllOrders);
router.delete("/:id", deleteOrder);

module.exports = router;
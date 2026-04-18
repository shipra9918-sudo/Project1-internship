const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/auth");

// =====================
// Consumer routes 
//@protected
// =====================
router.post("/", protect, orderController.createOrder);
router.get("/my-orders", protect, orderController.getMyOrders);

// =====================
// Merchant routes
//@protected
// =====================
router.get(
  "/merchant-orders",
  protect,
  authorize("merchant", "admin"),
  orderController.getMerchantOrders
);

router.get(
  "/restaurant/:restaurantId",
  protect,
  authorize("merchant", "admin"),
  orderController.getRestaurantOrders
);

// =====================
// Courier routes
// =====================
router.get(
  "/courier-deliveries",
  protect,
  authorize("courier", "admin"),
  orderController.getCourierDeliveries
);

// =====================
// ID routes (keep at bottom)
// =====================
router.get("/:id", protect, orderController.getOrder);

router.put(
  "/:id/status",
  protect,
  authorize("merchant", "courier", "admin"),
  orderController.updateOrderStatus
);

router.put(
  "/:id/accept-delivery",
  protect,
  authorize("courier", "admin"),
  orderController.acceptDelivery
);

router.put(
  "/:id/complete-delivery",
  protect,
  authorize("courier", "admin"),
  orderController.completeDelivery
);

// =====================
// Admin system route
// =====================
router.put(
  "/:id/assign-courier",
  protect,
  authorize("admin"),
  orderController.assignCourier
);

module.exports = router;
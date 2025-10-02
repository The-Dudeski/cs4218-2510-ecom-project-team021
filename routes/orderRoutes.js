import express from "express";
import {
  getOrdersController,
  getAllOrdersController,
  orderStatusController
} from "../controllers/orderController.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";

//router object
const router = express.Router();

//orders
router.get("/", requireSignIn, getOrdersController);

//all orders
router.get("/all", requireSignIn, isAdmin, getAllOrdersController);

// order status update
router.put(
  "/:orderId/status",
  requireSignIn,
  isAdmin,
  orderStatusController
);

export default router;
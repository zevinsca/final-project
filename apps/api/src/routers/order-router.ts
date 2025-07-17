import express from "express";

import {
  createOrder,
  updateOrderStatus,
} from "../controllers/order-controller.js";
import { verifyToken } from "../middleware/auth-middleware.js";

const router = express.Router();

router.route("/").post(verifyToken, createOrder);
router.route("/status").post(updateOrderStatus);

export default router;

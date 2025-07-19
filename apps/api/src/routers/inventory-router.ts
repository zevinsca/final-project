import express from "express";
import {
  getInventoryData,
  updateStockWithJournal,
  getInventoryHistory,
  getLowStockAlerts,
} from "../controllers/inventory-controller.js";
import { verifyToken, roleGuard } from "../middleware/auth-middleware.js";

const router = express.Router();

// GET /api/inventory - Mendapatkan data inventory (Admin only)
// POST /api/inventory/update-stock - Update stok dengan journal (Admin only)
router
  .route("/")
  .get(verifyToken, roleGuard("SUPER_ADMIN", "STORE_ADMIN"), getInventoryData)
  .post(
    verifyToken,
    roleGuard("SUPER_ADMIN", "STORE_ADMIN"),
    updateStockWithJournal
  );

// GET /api/inventory/history - Mendapatkan history perubahan inventory
router
  .route("/history")
  .get(
    verifyToken,
    roleGuard("SUPER_ADMIN", "STORE_ADMIN"),
    getInventoryHistory
  );

// GET /api/inventory/low-stock - Mendapatkan alert stok rendah
router
  .route("/low-stock")
  .get(verifyToken, roleGuard("SUPER_ADMIN", "STORE_ADMIN"), getLowStockAlerts);

export default router;

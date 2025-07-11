import express from "express";
import {
  createStore,
  getStoreById,
  getAllStores,
  createStoreProduct,
  deleteStore,
} from "../controllers/store-controler.js";
import { roleGuard, verifyToken } from "../middleware/auth-middleware.js";

const router = express.Router();

router
  .route("/")
  .get(verifyToken, getAllStores)
  .post(verifyToken, roleGuard("STORE_ADMIN"), createStoreProduct);

// GET satu store
router
  .route("/super-admin")
  .get(verifyToken, getAllStores)
  .post(verifyToken, roleGuard("SUPER_ADMIN"), createStore);
router
  .route("/super-admin/:storeId")
  .get(verifyToken, roleGuard("SUPER_ADMIN"), getStoreById);

router
  .route("/:storeId")
  .get(verifyToken, roleGuard("STORE_ADMIN"), getStoreById);
router.route("/:storeId").delete(deleteStore);
export default router;

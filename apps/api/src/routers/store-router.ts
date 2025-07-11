import express from "express";
import {
  createStore,
  getStoreById,
  getAllStores,
  createStoreProduct,
  getNearbyStoreProducts,
} from "../controllers/store-controler.js";
import { roleGuard, verifyToken } from "../middleware/auth-middleware.js";

const router = express.Router();

router
  .route("/")
  // .get(verifyToken, getAllStores)
  .get(getAllStores)
  .post(verifyToken, roleGuard("STORE_ADMIN"), createStoreProduct);

router
  .route("/nearby")
  .get(verifyToken, getNearbyStoreProducts)
  .post(verifyToken, roleGuard("STORE_ADMIN"), createStoreProduct);

// GET satu store
router
  .route("/super-admin")
  .get(verifyToken, getAllStores)
  .post(verifyToken, roleGuard("SUPER_ADMIN"), createStore);

router.route("/:storeId").get(getStoreById);
// .get(verifyToken, roleGuard("STORE_ADMIN"), getStoreById);
export default router;

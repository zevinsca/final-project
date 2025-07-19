import express from "express";

import { verifyToken, roleGuard } from "../middleware/auth-middleware.js";

import {
  getAllProduct,
  getAllProductsByCity,
  getNearbyProducts,
  getProductById,
} from "../controllers/product-controller/get/get-product.js";
import { createProduct } from "../controllers/product-controller/create/create-product.js";
import { createStoreProduct } from "../controllers/store-controller/create/create-store.js";

const router = express.Router();

router
  .route("/")
  .get(getAllProduct)
  .post(verifyToken, roleGuard("SUPER_ADMIN"), createProduct)
  .post(verifyToken, roleGuard("SUPER_ADMIN"), createStoreProduct);
router.route("/nearby").get(getNearbyProducts);
router.route("/by-province").get(getAllProductsByCity);
router.route("/:id").get(getProductById);

export default router;

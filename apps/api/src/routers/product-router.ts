import express from "express";
import {
  createProduct,
  getAllProduct,
  getAllProductsByCity,
  getProductById,
} from "../controllers/product-controller.js";
import { verifyToken, roleGuard } from "../middleware/auth-middleware.js";
import {
  createStoreProduct,
  getNearbyProducts,
} from "../controllers/store-controler.js";

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

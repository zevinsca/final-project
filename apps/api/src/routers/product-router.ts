import express from "express";
import {
  getAllProduct,
  getProductById,
} from "../controllers/product-controller.js";
import { verifyToken, roleGuard } from "../middleware/auth-middleware.js";
import {
  createStoreProduct,
  getNearbyProducts,
} from "../controllers/store-controler.js";

import { upload } from "../middleware/upload-middleware.js";
import { createProduct } from "../controllers/create-product-controller.js";
import {
  getAllProductsByCity,
  getAllProductsByStore,
} from "../controllers/get-product-controller.js";
import {
  deleteProduct,
  updateProduct,
} from "../controllers/update-product-controller.js";

const router = express.Router();

router
  .route("/")
  .get(getAllProduct)
  .post(
    verifyToken,
    roleGuard("SUPER_ADMIN", "STORE_ADMIN"),
    upload.fields([
      { name: "imagePreview", maxCount: 1 },
      { name: "imageContent", maxCount: 3 },
    ]),
    createProduct
  )
  .post(verifyToken, roleGuard("SUPER_ADMIN"), createStoreProduct);

router.route("/nearby").get(getNearbyProducts);
router.route("/by-province").get(getAllProductsByCity);
router.route("/by-store").get(getAllProductsByStore);

router
  .route("/:id")
  .get(getProductById)
  .patch(
    verifyToken,
    roleGuard("SUPER_ADMIN", "STORE_ADMIN"),
    upload.fields([
      { name: "imagePreview", maxCount: 1 },
      { name: "imageContent", maxCount: 3 },
    ]),
    updateProduct
  )

  .delete(verifyToken, roleGuard("SUPER_ADMIN"), deleteProduct);

export default router;

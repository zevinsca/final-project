import express from "express";
import {
  createProduct,
  getAllProduct,
  getAllProductsByCity,
  getAllProductsByStore,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product-controller.js";
import { verifyToken, roleGuard } from "../middleware/auth-middleware.js";
import {
  createStoreProduct,
  getNearbyProducts,
} from "../controllers/store-controler.js";
import { upload } from "../middleware/upload-middleware.js";

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

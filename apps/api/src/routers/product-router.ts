import express from "express";
import { Router } from "express";
import {
  getAllProduct,
  getProductById,
  createProduct,
} from "../controllers/product-controller";

const router = express.Router();

router.get("/", getAllProduct);
router.get("/:id", getProductById);
router.post("/", createProduct);

export default router;

import express from "express";
// Import authentication middleware
import { verifyToken, roleGuard } from "../middleware/auth-middleware.js";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
} from "../controllers/category-controller.js";
const router = express.Router();

// Route for getting all categories and creating a new category
router
  .route("/")
  .get(getAllCategories) // Fetch all categories
  .post(verifyToken, roleGuard("SUPER_ADMIN"), createCategory); // Only allow SUPER_ADMIN to create categories

// Route for getting, updating, or deleting a category by its ID
router
  .route("/:id")
  .get(getCategoryById) // Get category by ID
  .put(verifyToken, roleGuard("SUPER_ADMIN"), updateCategory) // Allow SUPER_ADMIN to update category
  .delete(verifyToken, roleGuard("SUPER_ADMIN"), deleteCategory); // Allow SUPER_ADMIN to delete category

export default router;

import express from "express";
import {
  deleteUser,
  getAllUser,
  getCurrentUser,
  getUsersByRole,
  // updateUserImage,
} from "../controllers/user-controller.js";
import { verifyToken } from "../middleware/auth-middleware.js";
import {
  createStoreAdmin,
  getStoreAdminById,
  getStoreAdmins,
  updateStoreAdmin,
} from "../controllers/store-admin-controller.js";

const router = express.Router();

router.route("/current-user").get(verifyToken, getCurrentUser);

/*                       GET ALL USER HANYA SUPER ADMIN                       */
/* -------------------------------------------------------------------------- */
router.route("/").get(getAllUser);
router.get("/users", getUsersByRole);

/* -------------------------------------------------------------------------- */
/*                        ROUTES UNTUK STORE ADMIN                           */
/* -------------------------------------------------------------------------- */
router.get("/store-admins", verifyToken, getStoreAdmins);
router.get("/store-admins/:id", verifyToken, getStoreAdminById);
router.post("/store-admins", verifyToken, createStoreAdmin);
router.put("/store-admins/:id", verifyToken, updateStoreAdmin);
router.delete("/:id", verifyToken, deleteUser);

export default router;

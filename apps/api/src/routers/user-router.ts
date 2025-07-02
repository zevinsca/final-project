import express from "express";
import {
  getAllUser,
  getCurrentUser,
  // updateUserImage,
} from "../controllers/user-controller.js";
import { roleGuard, verifyToken } from "../middleware/auth-middleware.js";

const router = express.Router();

router.route("/current-user").get(verifyToken, getCurrentUser);
/* -------------------------------------------------------------------------- */
/*                       GET ALL USER HANYA SUPER ADMIN                       */
/* -------------------------------------------------------------------------- */
router.route("/").get(getAllUser);

export default router;

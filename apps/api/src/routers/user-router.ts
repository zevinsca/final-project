import express from "express";
import {
  getAllUser,
  getCurrentUser,
  // updateUserImage,
} from "../controllers/user-controller";
import { verifyToken } from "../middleware/auth-middleware";

const router = express.Router();
router.use(verifyToken);
router.route("/current-user").get(getCurrentUser);
/* -------------------------------------------------------------------------- */
/*                       GET ALL USER HANYA SUPER ADMIN                       */
/* -------------------------------------------------------------------------- */
router.route("/").get(getAllUser);

export default router;

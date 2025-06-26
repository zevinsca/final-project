import express from "express";
import {
  getAllUser,
  getCurrentUser,
  // updateUserImage,
} from "../controllers/user-controller";
import { verifyToken } from "../middleware/auth-middleware";

const router = express.Router();

router.route("/").get(getAllUser);
router.route("/current-user").get(verifyToken, getCurrentUser);

export default router;

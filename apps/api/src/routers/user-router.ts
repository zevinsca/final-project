import express from "express";
import {
  getCurrentUser,
<<<<<<< HEAD
  updateUserImage,
=======
  // updateUserImage,
>>>>>>> development
} from "../controllers/user-controller";
import { verifyToken } from "../middleware/auth-middleware";

const router = express.Router();

router.route("/current-user").get(verifyToken, getCurrentUser);

export default router;

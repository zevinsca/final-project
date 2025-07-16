import express from "express";
import {
  confirmVerificationToken,
  getAllUser,
  getCurrentUser,
  getUsersByRole,
  sendVerificationEmail,
  // updateUserImage,
} from "../controllers/user-controller.js";
import { verifyToken } from "../middleware/auth-middleware.js";

const router = express.Router();

router.route("/current-user").get(verifyToken, getCurrentUser);
/* -------------------------------------------------------------------------- */
/*                       GET ALL USER HANYA SUPER ADMIN                       */
/* -------------------------------------------------------------------------- */
router.route("/").get(getAllUser);
router.route("/users").get(getUsersByRole);
// Kirim ulang verifikasi email (harus login)
router.route("/verify-email").post(verifyToken, sendVerificationEmail);

// Konfirmasi token dari link email → isVerified = true
router.route("/confirm-email").get(confirmVerificationToken);
export default router;

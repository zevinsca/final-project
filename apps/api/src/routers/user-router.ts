import express from "express";

import { verifyToken } from "../middleware/auth-middleware.js";
import {
  getAllUser,
  getCurrentUser,
  getUsersByRole,
} from "../controllers/user-controller/get/get-user.js";
import { updateCurrentUser } from "../controllers/user-controller/update/update-user.js";
import {
  confirmVerificationToken,
  sendVerificationEmail,
} from "../controllers/user-controller/update/verification.js";

const router = express.Router();

router
  .route("/current-user")
  .get(verifyToken, getCurrentUser)
  .put(verifyToken, updateCurrentUser);
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

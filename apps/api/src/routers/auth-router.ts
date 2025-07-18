import express from "express";
import passport from "passport";
import {
  login,
  logout,
  register,
  loginSuccess,
  loginFailed,
  sendVerificationEmail,
  VerifySuccess,
  loginGoogle,
  resetPassword,
  resendSetPasswordLink,
  confirmEmail,
  // setPassword
} from "../controllers/auth.controller.js";

import { changePassword } from "../controllers/user-controller.js";
import { authMiddleware, verifyToken } from "../middleware/auth-middleware.js";

const router = express.Router();

/* -------------------------------------------------------------------------- */
/*                                LOGIN GOOGLE                                */
/* -------------------------------------------------------------------------- */

// Redirect ke Google login
router.get("/login/success", loginSuccess);
router.get("/login/failed", loginFailed);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  loginGoogle
);
// Logout untuk user yang login lewat Google
router.route("/logout").delete(logout);

/* -------------------------------------------------------------------------- */
/*                               Verify Account                               */
/* -------------------------------------------------------------------------- */

router.route("/verify-email").post(verifyToken, sendVerificationEmail);
router.route("/confirm-email").get(confirmEmail);
router.route("/verify-success").get(VerifySuccess);

/* -------------------------------------------------------------------------- */
/*                     Login and register With MarketSnap                     */
/* -------------------------------------------------------------------------- */

router.route("/register").post(register);
router.route("/login").post(login); // Logout khusus JWT

/* -------------------------------------------------------------------------- */
/*                          Reser and change Password                         */
/* -------------------------------------------------------------------------- */

router.post("/reset-password", resendSetPasswordLink);

// Route to handle the actual password reset using the token
router.post("/set-password", resetPassword);

// Change password harus login
router.route("/change-password").post(authMiddleware, changePassword);
// router.route("/set-password").post(setPassword);
export default router;

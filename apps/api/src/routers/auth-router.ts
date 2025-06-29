import express from "express";
import passport from "passport";
import {
  login,
  logout,
  register,
  loginSuccess,
  loginFailed,
  verifyEmail,
  VerifySuccess,
  loginGoogle,
} from "../controllers/auth.controller.js";
import { Profile } from "passport";
import jwt from "jsonwebtoken";

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
/*                                LOGIN MANUAL                                */
/* -------------------------------------------------------------------------- */
router.route("/verify-email").get(verifyEmail).get(VerifySuccess);

router.post("/register", register);
router.post("/login", login); // Logout khusus JWT
export default router;

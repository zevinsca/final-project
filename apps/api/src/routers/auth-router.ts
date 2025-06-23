import express from "express";
import passport from "passport";
import {
  login,
  logout,
  register,
  signOut,
  loginSuccess,
  loginFailed,
} from "../controllers/auth.controller.js";

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
  passport.authenticate("google", {
    failureRedirect: "/api/v1/auth/login/failed",
    successRedirect: "http://localhost:3000",
  })
);

// Logout untuk user yang login lewat Google
router.get("/logout", logout);

/* -------------------------------------------------------------------------- */
/*                                LOGIN MANUAL                                */
/* -------------------------------------------------------------------------- */

router.post("/register", register);
router.post("/login", login);
router.delete("/logout/jwt", signOut); // Logout khusus JWT

export default router;

import express from "express";
import passport from "passport";
import {
  login,
  logout,
  register,
  signOut,
  loginSuccess,
} from "../controllers/auth.controller.js";

const router = express.Router();

/* -------------------------------------------------------------------------- */
/*                                LOGIN GOOGLE                                */
/* -------------------------------------------------------------------------- */

// Redirect ke Google login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback dari Google
router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "http://localhost:3000/dashboard", // atau /login-success (frontend)
    failureRedirect: "http://localhost:3000/login",
  })
);

// Cek login Google sukses (ambil req.user)
router.get("/login-success", loginSuccess);

// Logout untuk user yang login lewat Google
router.get("/logout", logout);

/* -------------------------------------------------------------------------- */
/*                                LOGIN MANUAL                                */
/* -------------------------------------------------------------------------- */

router.post("/register", register);
router.post("/login", login);
router.delete("/logout/jwt", signOut); // Logout khusus JWT

export default router;

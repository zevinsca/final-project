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
  (req, res) => {
    const googleUser = req.user as Profile;
    const accesstoken = jwt.sign(
      {
        id: googleUser.id,
        email: googleUser.emails?.[0].value,
        name: googleUser.displayName,
        photo: googleUser.photos?.[0].value,
        provider: "google",
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    res.cookie("accessToken", accesstoken, { httpOnly: true });
    res.redirect("http://localhost:3000");
  }
);
// Logout untuk user yang login lewat Google
router.route("/logout").delete(logout).delete(signOut);

/* -------------------------------------------------------------------------- */
/*                                LOGIN MANUAL                                */
/* -------------------------------------------------------------------------- */

router.post("/register", register);
router.post("/login", login); // Logout khusus JWT
export default router;
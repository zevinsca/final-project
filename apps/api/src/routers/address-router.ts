import express from "express";
import {
  createAddress,
  getUserAddresses,
  deleteAddress,
} from "../controllers/address-controller.js";
import { verifyToken } from "../middleware/auth-middleware.js";

const router = express.Router();

// Semua rute address di-protect oleh middleware verifyToken
router.use(verifyToken);

// GET dan POST semua address milik user yang sedang login
router.route("/").get(getUserAddresses).post(createAddress);

// DELETE address berdasarkan ID milik user
router.route("/:id").delete(deleteAddress);

export default router;

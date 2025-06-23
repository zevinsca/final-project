import express from "express";
import {
  createAddress,
  getUserAddresses,
  deleteAddress,
} from "../controllers/address-controller";
import { verifyToken } from "../middleware/auth-middleware";

const router = express.Router();

// Semua rute address di-protect oleh middleware verifyToken
router.use(verifyToken);

// GET semua address milik user yang sedang login
router.get("/", getUserAddresses);

// POST address baru untuk user yang sedang login
router.post("/", createAddress);

// DELETE address berdasarkan ID milik user
router.delete("/:id", deleteAddress);

export default router;

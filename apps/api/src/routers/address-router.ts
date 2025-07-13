import express from "express";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setPrimaryAddress,
  getAllProvincesFromStores,
} from "../controllers/address-controller.js";
import { verifyToken } from "../middleware/auth-middleware.js";

const router = express.Router();

// Semua rute address di-protect oleh middleware verifyToken

// GET dan POST semua address milik user yang sedang login
router.route("/").get(verifyToken, getAddresses).post(verifyToken, addAddress);

// DELETE address berdasarkan ID milik user
router
  .route("/:id")
  .put(verifyToken, updateAddress)
  .delete(verifyToken, deleteAddress);
router.route("/provinces").get(getAllProvincesFromStores);
router.route("/:id/set-primary").put(verifyToken, setPrimaryAddress);
export default router;

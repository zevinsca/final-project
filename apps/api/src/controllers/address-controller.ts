import { Request, Response } from "express";
import prisma from "../config/prisma-client";
import { CustomJwtPayload, GoogleJwtPayload } from "../types/express.js";
import { Profile } from "passport";
// GET semua alamat milik user saat ini

// POST tambah alamat baru
export async function createAddress(req: Request, res: Response) {
  try {
    const user = req.user as CustomJwtPayload;
    const userId = user.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const { street, city, state, postalCode, country } = req.body;

    const address = await prisma.address.create({
      data: {
        street,
        city,
        state,
        postalCode,
        country,
        userId,
      },
    });

    res.status(201).json({ message: "Address created", Address: address });
  } catch (error) {
    console.error("Create Address Error:", error);
    res.status(500).json({ message: "Failed to create address" });
  }
}

export async function getUserAddresses(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = req.user as CustomJwtPayload;
    const userId = user.id;

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res
      .status(200)
      .json({ message: "get Address Success", Address: addresses });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch addresses", error });
  }
}

export async function getAddressById(req: Request, res: Response) {
  try {
    const user = req.user as CustomJwtPayload;
    const userId = user.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const { id } = req.params;

    const address = await prisma.address.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!address) {
      res.status(404).json({ message: "Address not found" });
      return;
    }

    res
      .status(200)
      .json({ message: `get Address ${id}  Success`, Address: address });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch address", error });
  }
}
// DELETE alamat
export async function deleteAddress(req: Request, res: Response) {
  const { id } = req.params;

  try {
    await prisma.address.delete({ where: { id } });
    res.json({ message: "Alamat berhasil dihapus." });
  } catch (error) {
    res.status(500).json({ error: "Gagal menghapus alamat." });
  }
}

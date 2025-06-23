import { Request, Response } from "express";
import prisma from "../config/prisma-client";

// GET semua alamat milik user saat ini
export async function getUserAddresses(req: Request, res: Response) {
  const userId = req.user?.id;

  try {
    const addresses = await prisma.address.findMany({
      where: { userId },
    });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil alamat." });
  }
}

// POST tambah alamat baru
export async function createAddress(req: Request, res: Response) {
  const userId = req.user?.id;
  const { street, city, state, postalCode, country } = req.body;

  try {
    const newAddress = await prisma.address.create({
      data: {
        street,
        city,
        state,
        postalCode,
        country,
        userId,
      },
    });
    res.status(201).json(newAddress);
  } catch (error) {
    res.status(500).json({ error: "Gagal menambahkan alamat." });
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

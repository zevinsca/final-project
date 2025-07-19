import { Request, Response } from "express";
import prisma from "../../../config/prisma-client.js";

export async function deleteStore(req: Request, res: Response) {
  const { storeId } = req.params;

  try {
    // 1. Ambil semua StoreAddress yang terhubung ke Store ini
    const storeAddresses = await prisma.storeAddress.findMany({
      where: { storeId },
    });

    // 2. Hapus semua Address yang berelasi dengan masing-masing StoreAddress
    for (const sa of storeAddresses) {
      await prisma.address.deleteMany({
        where: { storeAddressId: sa.id },
      });
    }

    // 3. Hapus semua StoreAddress yang terkait dengan storeId
    await prisma.storeAddress.deleteMany({
      where: { storeId },
    });

    // 4. Hapus semua StoreProduct yang terkait dengan storeId (jika ada)
    await prisma.storeProduct.deleteMany({
      where: { storeId },
    });

    // 5. Hapus data Store itu sendiri
    const deletedStore = await prisma.store.delete({
      where: { id: storeId },
    });

    res
      .status(200)
      .json({ message: "Toko berhasil dihapus.", data: deletedStore });
  } catch (error) {
    console.error("Delete store error:", error);
    res.status(500).json({ message: "Terjadi kesalahan saat menghapus toko." });
  }
}

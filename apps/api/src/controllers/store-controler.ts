import { Request, Response } from "express";
import prisma from "../config/prisma-client.js";
import { CustomJwtPayload } from "../types/express.js";

export async function createStore(req: Request, res: Response) {
  const user = req.user as CustomJwtPayload;
  const userId = user.id;
  const { name, address, city, province, postalCode } = req.body;
  if (!userId || !name || !address || !city || !province || !postalCode) {
    res.status(400).json({ message: "All fields are required." });
    return;
  }
  try {
    // 2. Create Store (link ke address)
    const newStore = await prisma.store.create({
      data: {
        userId,
        name,
        address,
        city,
        province,
        postalCode,
      },
    });
    if (!newStore) {
      res.status(500).json({ message: "Failed to create store." });
      return;
    }

    const newAddress = await prisma.address.create({
      data: {
        storeId: newStore.id, // Assuming addressId is the same as store ID
        recipient: newStore.name, // Use store name as recipient
        address: newStore.address,
        city: newStore.city,
        province: newStore.province,
        postalCode: newStore.postalCode,
        isPrimary: false,
        userId,
      },
    });
    // 3. Create StoreProduct

    if (!newAddress) {
      res.status(500).json({ message: "Failed to create address." });
      return;
    }

    res.status(201).json({
      message: "Store, Address, and StoreProduct created successfully",
      data: { store: newStore, address: newAddress },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error creating store with address and store product" });
  }
}

export async function getStores(req: Request, res: Response) {
  const user = req.user as CustomJwtPayload;
  const userId = user.id;

  try {
    const stores = await prisma.store.findMany({
      where: {
        userId: userId,
      },
      include: {
        User: true, // Ambil data user yang memiliki store
        Product: true, // Ambil produk yang ada di store ini
        ProductInventory: true, // Ambil inventory produk di store ini
      },
      orderBy: {
        createdAt: "desc", // Urutkan berdasarkan tanggal dibuat
      },
    });

    res.status(200).json({
      message: "Stores fetched successfully",
      data: stores,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching stores" });
  }
}

export async function getOneStore(req: Request, res: Response) {
  const user = req.user as CustomJwtPayload;
  const userId = user.id;
  const { storeId } = req.params;

  if (!storeId) {
    res.status(400).json({ message: "Store ID is required." });
    return;
  }

  try {
    const store = await prisma.store.findUnique({
      where: {
        id: storeId,
      },
      include: {
        User: true, // Ambil data user yang memiliki store
        Product: true,
        ProductInventory: true, // Ambil inventory produk di store ini
      },
    });

    // Validasi apakah store ada dan milik user
    if (!store || store.userId !== userId) {
      res.status(404).json({ message: "Store not found or unauthorized." });
      return;
    }

    res.status(200).json({
      message: "Store fetched successfully",
      data: store,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching store." });
  }
}

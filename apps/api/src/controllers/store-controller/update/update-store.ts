import { Request, Response } from "express";
import prisma from "../../../config/prisma-client.js";
import { CustomJwtPayload } from "../../../types/express.js";

// Get a store by its ID along with its associated products

export async function updateStore(req: Request, res: Response) {
  const user = req.user as CustomJwtPayload;
  const userId = user.id;
  const storeId = req.params.storeId;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized user." });
    return;
  }

  const {
    name,
    address,
    city,
    province,
    postalCode,
    destination,
    latitude,
    longtitude,
  } = req.body;

  if (
    !name ||
    !address ||
    !city ||
    !province ||
    !postalCode ||
    !destination ||
    latitude === undefined ||
    longtitude === undefined
  ) {
    res.status(400).json({ message: "All fields are required." });
    return;
  }

  try {
    // 1. Check if store exists and owned by current user
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { StoreAddress: { include: { Address: true } } },
    });

    if (!store || store.userId !== userId) {
      res.status(404).json({ message: "Store not found or access denied." });
      return;
    }

    // 2. Update store name
    await prisma.store.update({
      where: { id: storeId },
      data: { name },
    });

    // 3. Update StoreAddress (ambil satu alamat pertama)
    const storeAddress = store.StoreAddress[0];
    if (storeAddress) {
      await prisma.storeAddress.update({
        where: { id: storeAddress.id },
        data: {
          latitude,
          longtitude,
        },
      });

      // 4. Update Address terkait
      const relatedAddress = storeAddress.Address[0];
      if (relatedAddress) {
        await prisma.address.update({
          where: { id: relatedAddress.id },
          data: {
            address,
            city,
            province,
            postalCode,
            destination,
          },
        });
      }
    }

    res.json({ message: "Store updated successfully." });
  } catch (error) {
    console.error("Update store error:", error);
    res.status(500).json({ message: "Error updating store." });
  }
}

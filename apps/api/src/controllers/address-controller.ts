import { Request, Response } from "express";
import prisma from "../config/prisma-client";
import { CustomJwtPayload, GoogleJwtPayload } from "../types/express.js";
import { Profile } from "passport";
// GET semua alamat milik user saat ini

// POST tambah alamat baru
/* -------------------------------------------------------------------------- */
/*                             CREATE USER ADDRESS                            */
/* -------------------------------------------------------------------------- */
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
/* -------------------------------------------------------------------------- */
/*                               GET ALL ADDRESS                              */
/* -------------------------------------------------------------------------- */
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
/* -------------------------------------------------------------------------- */
/*                               GET ADDRESSBYID                              */
/* -------------------------------------------------------------------------- */
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
/* -------------------------------------------------------------------------- */
/*                               UPDATE ADDRESS                               */
/* -------------------------------------------------------------------------- */
export async function updateAddress(req: Request, res: Response) {
  try {
    // Access the authenticated user data from req.user
    const user = req.user as CustomJwtPayload;
    const userId = user.id;

    // Check if userId exists, meaning the user is authorized
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Get the address ID from the request parameters and new address data from the body
    const { addressId } = req.params;
    const { street, city, state, postalCode, country } = req.body;

    // Validate if the data is present in the request body
    if (!street || !city || !state || !postalCode || !country) {
      res
        .status(400)
        .json({ message: "All fields are required to update address." });
      return;
    }

    // Check if the address belongs to the authenticated user
    const existingAddress = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!existingAddress) {
      res.status(404).json({ message: "Address not found" });
      return;
    }

    if (existingAddress.userId !== userId) {
      res
        .status(403)
        .json({ message: "You do not have permission to update this address" });
      return;
    }

    // Proceed to update the address in the database
    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: {
        street,
        city,
        state,
        postalCode,
        country,
      },
    });

    // Return the updated address data
    res.status(200).json({
      message: "Address updated successfully",
      address: updatedAddress,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating address", error });
  }
}
/* -------------------------------------------------------------------------- */
/*                               DELETE ADDRESS                               */
/* -------------------------------------------------------------------------- */
export async function deleteAddress(req: Request, res: Response) {
  const { id } = req.params;

  try {
    await prisma.address.delete({ where: { id } });
    res.json({ message: "Alamat berhasil dihapus." });
  } catch (error) {
    res.status(500).json({ error: "Gagal menghapus alamat." });
  }
}

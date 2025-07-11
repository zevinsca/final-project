import { Request, Response } from "express";
import prisma from "../config/prisma-client.js";
import { CustomJwtPayload } from "../types/express.js";

export async function createStore(req: Request, res: Response) {
  const user = req.user as CustomJwtPayload;
  const userId = user.id;
  if (!userId) {
    res.status(400).json({ message: "Need UserId." });
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
    longitude,
    // assuming the store is associated with a user
  } = req.body;

  // Validate incoming data
  if (
    !name ||
    !address ||
    !city ||
    !province ||
    !postalCode ||
    !destination ||
    !latitude ||
    !longitude
  ) {
    res.status(400).json({ message: "All fields are required." });
    return;
  }

  try {
    // 1. Create a new store
    const newStore = await prisma.store.create({
      data: {
        name,
        userId: userId, // Associated user who owns the store
      },
    });

    // 2. Create a new address for the store
    const newAddress = await prisma.address.create({
      data: {
        storeId: newStore.id, // Link the address to the store
        address,
        city,
        province,
        postalCode,
        destination,
        latitude,
        longitude,
        isPrimary: true, // Set this address as primary (optional)
      },
    });

    // 3. Return the newly created store and address
    res.status(201).json({
      message: "Store created successfully!",
      store: newStore,
      address: newAddress,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating the store." });
  }
}

// Get all stores with their associated addresses and store products
export async function getAllStores(_req: Request, res: Response) {
  try {
    const stores = await prisma.store.findMany({
      include: {
        StoreProduct: true,
        Addresses: true,
      },
    });
    res
      .status(200)
      .json({ message: "Daftar toko berhasil diambil.", data: stores });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan saat mengambil daftar toko." });
  }
}
export async function deleteStore(req: Request, res: Response) {
  const { storeId } = req.params;

  try {
    const deletedStore = await prisma.store.delete({
      where: { id: storeId },
    });

    res
      .status(200)
      .json({ message: "Toko berhasil dihapus.", data: deletedStore });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan saat menghapus toko." });
  }
}
// Get a store by its ID along with its associated products
export async function getStoreById(req: Request, res: Response): Promise<void> {
  const storeId = req.params.storeId; // Get storeId from URL params

  // Validate storeId
  if (!storeId) {
    res.status(400).json({ message: "Store ID is required." });
    return;
  }

  try {
    // Fetch the store along with related StoreProduct and Product details
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        StoreProduct: {
          include: {
            Product: true, // Include the associated product details
          },
        },
      },
    });

    if (!store) {
      res.status(404).json({ message: "Store not found." });
      return;
    }

    // Return the store with the related StoreProduct and Product details
    res.status(200).json({
      data: store,
    });
  } catch (error) {
    console.error("Error retrieving store:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Create a product for a store (storeId, productId, and stock quantity)
export async function createStoreProduct(req: Request, res: Response) {
  const { storeId, productId, stock } = req.body;

  try {
    // Validate inputs
    if (!storeId || !productId || stock === undefined) {
      res.status(400).json({ message: "All fields are required." });
      return;
    }

    // Create a new store product entry
    const storeProduct = await prisma.storeProduct.create({
      data: {
        storeId,
        productId,
        stock,
      },
    });

    if (!storeProduct) {
      res.status(500).json({ message: "Error creating product for store." });
      return;
    }

    // Return success response
    res.status(201).json({
      message: "Product created for the store successfully.",
      data: storeProduct,
    });
  } catch (error) {
    console.error("Error creating store product:", error);
    res.status(500).json({ message: "Error creating store product." });
  }
}

// Fungsi untuk menghitung jarak antara dua titik koordinat
export async function getNearbyProducts(req: Request, res: Response) {
  const { latitude, longitude, radius = 5000 } = req.query;

  if (!latitude || !longitude) {
    res.status(400).json({ message: "Latitude and longitude are required." });
    return;
  }

  const lat = parseFloat(latitude as string);
  const lon = parseFloat(longitude as string);
  const rad = parseFloat(radius as string);

  try {
    // Ambil semua toko
    const stores = await prisma.store.findMany({
      include: {
        StoreProduct: {
          include: {
            Product: true,
          },
        },
        Addresses: true,
      },
    });

    // Filter store berdasarkan jarak
    const nearbyStores = stores.filter((store) => {
      const storeAddress = store.Addresses.find(
        (addr) => addr.latitude && addr.longitude
      );
      if (!storeAddress) return false;

      const distance = calculateDistance(
        lat,
        lon,
        storeAddress.latitude!,
        storeAddress.longitude!
      );
      return distance <= rad;
    });

    // Kumpulkan semua produk dari toko-toko terdekat
    const products = nearbyStores.flatMap((store) =>
      store.StoreProduct.map((sp) => sp.Product)
    );

    res.json({ nearbyStores: nearbyStores.map((s) => s.name), products });
  } catch (error) {
    console.error("Error fetching nearby products:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
}

import { Request, Response } from "express";
import prisma from "../config/prisma-client.js";
import { CustomJwtPayload } from "../types/express.js";

export async function createStore(req: Request, res: Response) {
  const user = req.user as CustomJwtPayload;
  const userId = user.id;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized. User not found." });
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
  } = req.body;

  // Validasi input
  if (
    !name ||
    !address ||
    !city ||
    !province ||
    !postalCode ||
    !destination ||
    latitude === undefined ||
    longitude === undefined
  ) {
    res.status(400).json({ message: "All fields are required." });
    return;
  }

  try {
    // 1. Create Store
    const store = await prisma.store.create({
      data: {
        name,
        userId: userId,
      },
    });

    // 2. Create StoreAddress
    const storeAddress = await prisma.storeAddress.create({
      data: {
        storeId: store.id,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      },
    });

    // 3. Create Address terkait dengan StoreAddress
    const createdAddress = await prisma.address.create({
      data: {
        address,
        city,
        province,
        postalCode,
        destination,
        storeAddressId: storeAddress.id,
      },
    });

    res.status(201).json({
      message: "Store created successfully.",
      data: {
        store,
        storeAddress,
        address: createdAddress,
      },
    });
  } catch (error) {
    console.error("Create store error:", error);
    res.status(500).json({ message: "Error creating store." });
  }
}

// Get all stores with their associated addresses and store products
export async function getAllStores(_req: Request, res: Response) {
  try {
    const stores = await prisma.store.findMany({
      include: {
        StoreAddress: {
          include: {
            Address: true,
          },
        },
      },
    });
    if (!stores) {
      res.status(400).json({ message: "Stores Not Found" });
      return;
    }
    res.status(200).json({ message: "Stores fetched.", data: stores });
  } catch (error) {
    console.error("Fetch stores error:", error);
    res.status(500).json({ message: "Error fetching stores." });
  }
}

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
// Get a store by its ID along with its associated products
export async function getStoreById(req: Request, res: Response) {
  const { storeId } = req.params;

  if (!storeId) {
    res.status(400).json({ message: "Store ID is required." });
    return;
  }

  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        StoreProduct: {
          include: { Product: true },
        },
        StoreAddress: {
          include: {
            Address: true,
          },
        },
      },
    });

    if (!store) {
      res.status(404).json({ message: "Store not found." });
      return;
    }

    res.status(200).json({ message: `Get ${storeId} success`, data: store });
  } catch (error) {
    console.error("Get store by ID error:", error);
    res.status(500).json({ message: "Error retrieving store." });
  }
}
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
    longitude,
  } = req.body;

  if (
    !name ||
    !address ||
    !city ||
    !province ||
    !postalCode ||
    !destination ||
    latitude === undefined ||
    longitude === undefined
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
          longitude,
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
export async function getNearbyProducts(
  req: Request,
  res: Response
): Promise<void> {
  const { latitude, longitude, radius = 5000, category } = req.query;

  const search = req.query.search as string | undefined;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  if (!latitude || !longitude) {
    res.status(400).json({ message: "Latitude and longitude are required." });
    return;
  }

  const lat = parseFloat(latitude as string);
  const lon = parseFloat(longitude as string);
  const rad = parseFloat(radius as string);

  try {
    // 1. Ambil semua store & alamat
    const stores = await prisma.store.findMany({
      include: { StoreAddress: true },
    });

    // 2. Filter store berdasarkan jarak
    const nearbyStores = stores
      .map((store) => {
        const addr = store.StoreAddress[0];
        if (!addr?.latitude || !addr?.longitude) return null;
        const distance = calculateDistance(
          lat,
          lon,
          addr.latitude,
          addr.longitude
        );
        return distance <= rad
          ? { id: store.id, name: store.name, distance }
          : null;
      })
      .filter(
        (s): s is { id: string; name: string; distance: number } => s !== null
      );

    if (nearbyStores.length === 0) {
      res.json({
        nearbyStores: [],
        products: [],
        pagination: {
          page,
          limit,
          totalItems: 0,
          totalPages: 0,
        },
      });
    }

    const nearbyStoreIds = nearbyStores.map((s) => s.id);

    // 3. Buat filter dinamis untuk kategori
    const productFilter: any = {
      deletedAt: null,
      name: search
        ? {
            contains: search,
            mode: "insensitive",
          }
        : undefined,
    };

    if (category && typeof category === "string") {
      productFilter.ProductCategory = {
        some: {
          Category: {
            name: { equals: category, mode: "insensitive" },
          },
        },
      };
    }

    // 4. Query produk (storeProduct) dengan filter kategori
    const [storeProducts, totalItems] = await Promise.all([
      prisma.storeProduct.findMany({
        where: {
          storeId: { in: nearbyStoreIds },
          deletedAt: null,
          Product: productFilter,
        },
        include: {
          Product: {
            include: {
              imagePreview: true,
              ProductCategory: { include: { Category: true } },
            },
          },
          Store: true,
        },
        skip: offset,
        take: limit,
      }),
      prisma.storeProduct.count({
        where: {
          storeId: { in: nearbyStoreIds },
          deletedAt: null,
          Product: productFilter,
        },
      }),
    ]);

    const products = storeProducts.map((sp) => ({
      ...sp.Product,
      stock: sp.stock,
      storeName: sp.Store?.name ?? null,
    }));

    res.json({
      nearbyStores,
      products,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    });
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
  const R = 6371e3; // Radius bumi dalam meter
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Jarak dalam meter
}

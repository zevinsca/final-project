import { Request, Response } from "express";
import prisma from "../config/prisma-client.js";
import { CustomJwtPayload } from "../types/express.js";

export async function createStore(req: Request, res: Response) {
  try {
    const user = req.user as CustomJwtPayload;
    const userId = user.id;
    console.log("Requester (yang login SUPER_ADMIN):", userId);

    const { name, address, city, province, postalCode, latitude, longitude } =
      req.body;

    if (
      !name ||
      !address ||
      !city ||
      !province ||
      !postalCode ||
      !latitude ||
      !longitude
    ) {
      res.status(400).json({ message: "All fields are required." });
      return;
    }

    // Buat store
    const newStore = await prisma.store.create({
      data: {
        userId: userId, // ini SUPER_ADMIN
        name,
        address,
        city,
        province,
        postalCode,
        latitude,
        longitude,
      },
    });

    if (!newStore) {
      res.status(500).json({ message: "Error creating Store" });
      return;
    }
    // Buat address
    const newAddress = await prisma.address.create({
      data: {
        storeId: newStore.id,
        recipient: newStore.name,
        address: newStore.address,
        city: newStore.city,
        province: newStore.province,
        postalCode: newStore.postalCode,
        isPrimary: true,
      },
    });
    if (!newAddress) {
      res.status(500).json({ message: "Error creating address for store." });
      return;
    }

    res.status(201).json({
      message: "Store and address created successfully.",
      data: { store: newStore, address: newAddress },
    });
  } catch (error) {
    console.error("Error creating store:", error);
    res.status(500).json({ message: "Error creating store with address." });
  }
}

export async function getAllStores(_req: Request, res: Response) {
  try {
    const stores = await prisma.store.findMany({
      include: {
        Address: true, // Include address associated with the store
        StoreProduct: true,
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

// function calculateDistance(lat1, lon1, lat2, lon2) {
//   return geolib.getDistance({ latitude: lat1, longitude: lon1 }, { latitude: lat2, longitude: lon2 });
// }

// async function getNearbyProducts(req, res) {
//   try {
//     const { userLat, userLon } = req.body; // Lokasi pengguna yang dikirim dari frontend

//     if (!userLat || !userLon) {
//       return res.status(400).json({ message: 'User location is required' });
//     }

//     // Ambil semua toko dari database
//     const stores = await prisma.store.findMany();
//     const storesWithDistance = stores.map(store => {
//       const distance = calculateDistance(userLat, userLon, store.latitude, store.longitude);
//       return { ...store, distance }; // Menambahkan informasi jarak ke toko
//     });

//     // Urutkan toko berdasarkan jarak terdekat
//     const sortedStores = storesWithDistance.sort((a, b) => a.distance - b.distance);
//     const nearestStore = sortedStores[0]; // Ambil toko terdekat

//     // Ambil produk dari toko terdekat
//     const products = await prisma.product.findMany({
//       where: {
//         storeId: nearestStore.id,
//       },
//       include: {
//         ProductCategory: true,
//         Store: true,
//       },
//     });

//     return res.status(200).json({ store: nearestStore, products });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// }

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
          // Including StoreProduct, which links products to store
          include: {
            Product: true,
            // Include the associated product details
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

export async function createStoreProduct(req: Request, res: Response) {
  const { storeId, productId, stock } = req.body;
  try {
    if (!storeId || !productId || stock === undefined) {
      res.status(400).json({ message: "All fields are required." });
      return;
    }

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
  } catch (error) {
    console.error("Error creating store product:", error);
    res.status(500).json({ message: "Error creating store product." });
  }
}

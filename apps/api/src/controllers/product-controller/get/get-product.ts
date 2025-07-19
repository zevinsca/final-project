import { Request, Response } from "express";
import prisma from "../../../config/prisma-client.js";

export async function getAllProduct(req: Request, res: Response) {
  try {
    const search = req.query.search as string | undefined;
    const products = await prisma.product.findMany({
      where: search
        ? {
            name: {
              contains: search,
              mode: "insensitive", // biar case insensitive
            },
          }
        : undefined,
      include: {
        ProductCategory: { include: { Category: true } },
        User: true,
        imageContent: true,
        imagePreview: true,
        StoreProduct: true,
      },
    });

    const finalResult = products.map((item) => {
      return {
        id: item.id,
        name: item.name,
        decription: item.description,
        price: item.price,
        imagePreview: item.imagePreview,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        category: item.ProductCategory.map(
          (el: { Category: { name: string } }) => el.Category.name
        ),
      };
    });

    res.status(200).json({ data: finalResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get all products data" });
  }
}

export async function getProductById(req: Request, res: Response) {
  try {
    const id = req.params.id;
    console.log("Mencari produk dengan ID:", id);

    const product = await prisma.product.findFirst({
      where: {
        id,
        deletedAt: null, // hanya ambil yang belum dihapus
      },
      include: {
        ProductCategory: {
          include: {
            Category: true,
          },
        },
        User: true,
        imageContent: true,
        imagePreview: true,
        StoreProduct: {
          include: {
            Store: true,
          },
        },
      },
    });

    if (!product) {
      res.status(404).json({ message: "Produk tidak ditemukan." });
      return;
    }

    res.status(200).json({ data: product });
  } catch (error) {
    console.error("Gagal mengambil produk berdasarkan ID:", error);
    res.status(500).json({ message: "Gagal mengambil produk berdasarkan ID." });
  }
}

export async function getAllProductsByCity(req: Request, res: Response) {
  try {
    const { province, category: rawCategory, search: rawSearch } = req.query;

    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Sort parameters
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) || "desc";

    // Validate province
    if (!province || typeof province !== "string") {
      res.status(400).json({ message: "Province parameter is required." });
      return;
    }

    // Normalize and validate filters
    const category =
      typeof rawCategory === "string"
        ? rawCategory
        : Array.isArray(rawCategory)
          ? rawCategory[0]
          : undefined;

    const search =
      typeof rawSearch === "string"
        ? rawSearch
        : Array.isArray(rawSearch)
          ? rawSearch[0]
          : undefined;

    const allowedSortFields = ["name", "price", "createdAt", "updatedAt"];
    const finalSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";
    const finalSortOrder = sortOrder.toLowerCase() === "asc" ? "asc" : "desc";

    // Step 1: Get all addresses in that province
    const addresses = await prisma.address.findMany({
      where: {
        province: {
          equals: province,
          mode: "insensitive",
        },
        storeAddressId: { not: null },
      },
      select: { storeAddressId: true },
    });

    const storeAddressIds = addresses.map((addr) => addr.storeAddressId!);

    // Step 2: Get store IDs connected to those addresses
    const storeAddresses = await prisma.storeAddress.findMany({
      where: {
        id: { in: storeAddressIds },
      },
      select: { storeId: true },
    });

    const storeIds = storeAddresses.map((sa) => sa.storeId);

    // Step 3: Filter by category and/or search if provided
    let productIds: string[] | undefined = undefined;

    if (category || search) {
      const productWhere: any = {
        deletedAt: null,
      };

      if (category) {
        productWhere.ProductCategory = {
          some: {
            Category: {
              name: { equals: category, mode: "insensitive" },
            },
          },
        };
      }

      if (search) {
        productWhere.name = {
          contains: search,
          mode: "insensitive",
        };
      }

      const products = await prisma.product.findMany({
        where: productWhere,
        select: { id: true },
      });

      productIds = products.map((p) => p.id);
    }

    // Step 4: Build WHERE clause
    const where: any = {
      storeId: { in: storeIds },
      deletedAt: null,
      ...(productIds && { productId: { in: productIds } }),
    };

    // Step 5: Get total count
    const totalProducts = await prisma.storeProduct.count({
      where,
    });

    // Step 6: Build orderBy for nested Product relation
    const orderBy: any = {
      Product: { [finalSortBy]: finalSortOrder },
    };

    // Step 7: Get storeProducts with pagination
    const storeProducts = await prisma.storeProduct.findMany({
      where,
      include: {
        Product: {
          include: {
            imagePreview: true,
            ProductCategory: { include: { Category: true } },
          },
        },
        Store: {
          include: {
            StoreAddress: {
              include: {
                Address: true,
              },
            },
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    // Step 8: Calculate pagination info
    const totalPages = Math.ceil(totalProducts / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      message: `Products in province: ${province}`,
      data: storeProducts,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalProducts,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        province,
        category: category || null,
        search: search || null,
        sortBy: finalSortBy,
        sortOrder: finalSortOrder,
      },
    });
  } catch (error) {
    console.error("Error fetching products by province:", error);
    res.status(500).json({ message: "Error fetching products." });
  }
}

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
    // Ambil semua store beserta alamat dan produk
    const stores = await prisma.store.findMany({
      include: {
        StoreAddress: true,
        StoreProduct: {
          include: {
            Product: true,
          },
        },
      },
    });

    // Filter store berdasarkan jarak dari StoreAddress
    const nearbyStores = stores.filter((store) => {
      const addr = store.StoreAddress[0]; // Ambil StoreAddress pertama jika ada
      if (!addr?.latitude || !addr?.longtitude) return false;

      const distance = calculateDistance(
        lat,
        lon,
        addr.latitude,
        addr.longtitude
      );
      // Simpan nilai jarak ke dalam store.distance (opsional, jika perlu dipakai di frontend)
      store.distance = distance;

      return distance <= rad;
    });

    // Ambil semua produk dari toko-toko terdekat
    const products = nearbyStores.flatMap((store) =>
      store.StoreProduct.map((sp) => sp.Product)
    );

    res.json({
      nearbyStores: nearbyStores.map((s) => ({
        id: s.id,
        name: s.name,
        distance: s.distance,
      })),
      products,
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

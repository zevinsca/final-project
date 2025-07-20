import { Request, Response } from "express";
import prisma from "../config/prisma-client.js";

// GET ALL PRODUCT
export async function getAllProduct(req: Request, res: Response) {
  try {
    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const sortBy = (req.query.sortBy as string) || "createdAt"; // default sort by createdAt
    const sortOrder = (req.query.sortOrder as string) || "desc"; // default desc

    const allowedSortFields = [
      "name",
      "price",
      "createdAt",
      "updatedAt",
      "stock",
    ];
    const finalSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";

    const finalSortOrder = sortOrder.toLowerCase() === "asc" ? "asc" : "desc";

    const where: any = {
      deletedAt: null,
    };

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (category) {
      where.ProductCategory = {
        some: {
          Category: {
            name: {
              equals: category,
              mode: "insensitive",
            },
          },
        },
      };
    }
    let orderBy: any = {};

    if (finalSortBy === "stock") {
      orderBy = {
        StoreProduct: {
          _count: finalSortOrder,
        },
      };
    } else {
      orderBy[finalSortBy] = finalSortOrder;
    }

    const totalProducts = await prisma.product.count({
      where,
    });
    const products = await prisma.product.findMany({
      where,
      include: {
        ProductCategory: { include: { Category: true } },
        User: true,
        imageContent: true,
        imagePreview: true,
        StoreProduct: {
          include: {
            Store: true,
          },
        },
        Discount: {
          where: {
            deletedAt: null,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
          orderBy: { value: "desc" },
          take: 1,
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    let finalResult = products.map((item) => {
      const storeProduct = item.StoreProduct?.[0];

      return {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        stock: storeProduct ? storeProduct.stock : 0,
        storeName: storeProduct?.Store?.name ?? null,
        imagePreview: item.imagePreview,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        category: item.ProductCategory.map((el) => el.Category.name),
      };
    });

    if (finalSortBy === "stock") {
      finalResult = finalResult.sort((a, b) => {
        if (finalSortOrder === "asc") {
          return a.stock - b.stock;
        } else {
          return b.stock - a.stock;
        }
      });
    }
    const totalPages = Math.ceil(totalProducts / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      data: finalResult,
      meta: {
        currentPage: page,
        totalPages,
        totalItems: totalProducts,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        search: search || null,
        category: category || null,
        sortBy: finalSortBy,
        sortOrder: finalSortOrder,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get all products data" });
  }
}
// GET PRODUCT BY ID
export async function getProductById(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const { lat, lng, province, includeAllStores } = req.query;

    const product = await prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        imagePreview: true,
        imageContent: true,
        ProductCategory: { include: { Category: true } }, // 🔥 TAMBAH DISCOUNT MANUAL
        Discount: {
          where: {
            deletedAt: null,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
          orderBy: { value: "desc" },
          take: 1,
        },
      },
    });
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    if (includeAllStores === "true") {
      const allStoreProducts = await prisma.storeProduct.findMany({
        where: { productId: id, deletedAt: null },
        include: { Store: true },
      });

      res.status(200).json({
        data: {
          ...product,
          StoreProduct: allStoreProducts,
        },
      });
    }

    // ✅ LOGIC LAMA TETAP SAMA - untuk customer/user
    let storeProduct;

    // Prioritas 1: Jika lat & lng tersedia, cari toko terdekat (simple Euclidean)
    if (lat && lng) {
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);

      const stores = await prisma.storeAddress.findMany({
        where: {
          Store: {
            StoreProduct: {
              some: { productId: id, deletedAt: null },
            },
          },
        },
        include: {
          Store: {
            include: {
              StoreProduct: {
                where: { productId: id, deletedAt: null },
              },
            },
          },
        },
      });

      // Hitung jarak dan cari yang terdekat
      let minDistance = Infinity;
      let nearestStore = null;

      for (const store of stores) {
        const dist = Math.sqrt(
          Math.pow(store.latitude - latitude, 2) +
            Math.pow(store.longitude - longitude, 2)
        );

        if (dist < minDistance) {
          minDistance = dist;
          nearestStore = store;
        }
      }

      storeProduct = nearestStore?.Store?.StoreProduct?.[0];
    }

    // Prioritas 2: jika ada provinsi
    if (!storeProduct && province) {
      const addresses = await prisma.address.findMany({
        where: {
          province: { equals: province as string, mode: "insensitive" },
          storeAddressId: { not: null },
        },
        select: { storeAddressId: true },
      });

      const storeAddressIds = addresses.map((a) => a.storeAddressId!);

      const storeAddress = await prisma.storeAddress.findFirst({
        where: {
          id: { in: storeAddressIds },
          Store: {
            StoreProduct: {
              some: { productId: id, deletedAt: null },
            },
          },
        },
        include: {
          Store: {
            include: {
              StoreProduct: {
                where: { productId: id, deletedAt: null },
              },
            },
          },
        },
      });

      storeProduct = storeAddress?.Store.StoreProduct?.[0];
    }

    // Fallback: ambil dari toko manapun yang punya produk
    if (!storeProduct) {
      storeProduct = await prisma.storeProduct.findFirst({
        where: { productId: id, deletedAt: null },
      });
    }

    res.status(200).json({
      data: {
        ...product,
        StoreProduct: storeProduct ? [storeProduct] : [],
      },
    });
  } catch (error) {
    console.error("❌ Error getProductById:", error);
    res.status(500).json({ message: "Error fetching product by ID" });
  }
}

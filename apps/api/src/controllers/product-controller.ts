import { Request, Response } from "express";
import prisma from "../config/prisma-client.js";

// GET ALL PRODUCT
export async function getAllProduct(req: Request, res: Response) {
  try {
    // 1. EXTRACT QUERY PARAMETERS
    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;

    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Sort parameters
    const sortBy = (req.query.sortBy as string) || "createdAt"; // default sort by createdAt
    const sortOrder = (req.query.sortOrder as string) || "desc"; // default desc

    // Validate sortBy to prevent SQL injection - TAMBAHKAN "stock" di sini
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

    // Validate sortOrder
    const finalSortOrder = sortOrder.toLowerCase() === "asc" ? "asc" : "desc";

    // 2. BUILD WHERE CLAUSE
    const where: any = {
      deletedAt: null,
    };

    // Search filter (name contains)
    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    // Category filter
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

    // 3. BUILD ORDER BY CLAUSE - MODIFIKASI untuk handle sorting by stock
    let orderBy: any = {};

    if (finalSortBy === "stock") {
      // Untuk sorting stock, kita perlu join dengan StoreProduct
      orderBy = {
        StoreProduct: {
          _count: finalSortOrder, // atau bisa pakai cara lain tergantung kebutuhan
        },
      };
    } else {
      orderBy[finalSortBy] = finalSortOrder;
    }

    // 4. GET TOTAL COUNT (for pagination info)
    const totalProducts = await prisma.product.count({
      where,
    });

    // 5. QUERY PRODUCTS WITH PAGINATION AND SORTING
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
      },
      orderBy,
      skip,
      take: limit,
    });

    // 6. MAPPING RESULTS - Jika sort by stock, kita bisa sort di memory sebagai fallback
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

    // Fallback sorting untuk stock di memory jika perlu
    if (finalSortBy === "stock") {
      finalResult = finalResult.sort((a, b) => {
        if (finalSortOrder === "asc") {
          return a.stock - b.stock;
        } else {
          return b.stock - a.stock;
        }
      });
    }

    // 7. CALCULATE PAGINATION INFO
    const totalPages = Math.ceil(totalProducts / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // 8. RETURN RESPONSE WITH PAGINATION INFO - UBAH "pagination" jadi "meta"
    // untuk konsisten dengan frontend
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
    const { lat, lng, province } = req.query;

    const product = await prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        imagePreview: true,
        imageContent: true,
        ProductCategory: { include: { Category: true } },
      },
    });

    if (!product) return res.status(404).json({ message: "Product not found" });

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
